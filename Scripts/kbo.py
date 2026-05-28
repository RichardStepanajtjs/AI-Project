import pandas as pd
import numpy as np
import requests

class KBO():
    def __init__(self, api_url="nest.sokrates.traefik.me/kbo-companies/bulk"):
        self.api_url = api_url

    def load_data(self):
        filenames = ["activity", "address", "branch", "code", "contact", "denomination", "enterprise", "establishment", "meta"]

        dataframes = {}
        for name in filenames:
            if name == "meta":
                df = pd.read_csv(f"kbo_data/{name}.csv", sep=";", dtype=str)
            else:
                df = pd.read_csv(f"kbo_data/{name}.csv", dtype=str)
            dataframes[name] = df

        return dataframes

    def print_data(self):
        # used to inspect the raw datasets
        dataframes = self.load_data()
        for df in dataframes.values():
            print(df.head())

    def combine_df(self):
        dfs = self.load_data()

        # start with enterprise as the base
        enterprise = dfs["enterprise"]
        enterprise.rename(columns={"EnterpriseNumber": "enterprise_number"}, inplace=True)

        denom = dfs["denomination"]
        naam = denom[(denom["TypeOfDenomination"] == "001") & (denom["Language"] == "2")][["EntityNumber", "Denomination"]].drop_duplicates("EntityNumber")
        naam.rename(columns={"EntityNumber": "enterprise_number", "Denomination": "naam"}, inplace=True)

        # fallback if no dutch name is found
        fallback = denom[denom["TypeOfDenomination"] == "001"][["EntityNumber", "Denomination"]].drop_duplicates("EntityNumber")
        fallback.rename(columns={"EntityNumber": "enterprise_number", "Denomination": "naam"}, inplace=True)

        # address
        address = dfs["address"]
        addr = address[address["TypeOfAddress"] == "REGO"][["EntityNumber", "Zipcode", "MunicipalityNL", "StreetNL", "HouseNumber"]].drop_duplicates("EntityNumber")
        addr.rename(columns={
            "EntityNumber": "enterprise_number",
            "Zipcode": "postcode",
            "MunicipalityNL": "gemeente",
            "StreetNL": "straat",
            "HouseNumber": "huisnummer"
        }, inplace=True)

        # lookup table built early, used for both contacts and activities
        establishment = dfs["establishment"]
        entity_to_enterprise = dict(zip(establishment["EstablishmentNumber"], establishment["EnterpriseNumber"]))

        # map establishment numbers to enterprise numbers in contact.csv
        # many companies only register email/phone under their main establishment
        contact = dfs["contact"].copy()
        contact["EntityNumber"] = contact["EntityNumber"].apply(
            lambda x: entity_to_enterprise.get(x, x)
        )
        contact = contact.sort_values("EntityContact", ascending=True)

        email = contact[contact["ContactType"] == "EMAIL"][["EntityNumber", "Value"]].drop_duplicates("EntityNumber")
        email.rename(columns={"EntityNumber": "enterprise_number", "Value": "email"}, inplace=True)

        tel = contact[contact["ContactType"] == "TEL"][["EntityNumber", "Value"]].drop_duplicates("EntityNumber")
        tel.rename(columns={"EntityNumber": "enterprise_number", "Value": "telefoonnummer"}, inplace=True)

        # map establishment numbers to enterprise numbers in activity.csv as well
        activity = dfs["activity"].copy()
        activity["EntityNumber"] = activity["EntityNumber"].apply(
            lambda x: entity_to_enterprise.get(x, x)
        )

        # dutch labels from code.csv
        code = dfs["code"]
        nace_labels = code[code["Language"] == "NL"].copy()
        nace_labels["Category"] = nace_labels["Category"].str.strip('"')
        nace_labels = nace_labels[nace_labels["Category"].str.startswith("Nace")]
        nace_labels["NaceVersion"] = nace_labels["Category"].str.extract(r"(\d+)")
        nace_labels = nace_labels[["NaceVersion", "Code", "Description"]].drop_duplicates(["NaceVersion", "Code"])

        # sort NaceVersion and ActivityGroup descending so 2025 comes first and "006" (ONSS) before "001" (VAT)
        main_activities = activity[activity["Classification"] == "MAIN"].copy()
        main_activities = main_activities.sort_values(["NaceVersion", "ActivityGroup"], ascending=[False, False])

        # join dutch description and build "CODE - Description" strings
        main_activities = main_activities.merge(
            nace_labels,
            left_on=["NaceVersion", "NaceCode"],
            right_on=["NaceVersion", "Code"],
            how="left"
        )
        main_activities["nace_str"] = main_activities["NaceCode"] + " - " + main_activities["Description"].fillna("")
        main_activities.rename(columns={"EntityNumber": "enterprise_number"}, inplace=True)

        # keep only activities from the most recent NaceVersion per company
        max_version = main_activities.groupby("enterprise_number")["NaceVersion"].max().reset_index()
        max_version.rename(columns={"NaceVersion": "max_version"}, inplace=True)
        main_activities = main_activities.merge(max_version, on="enterprise_number")
        main_activities = main_activities[main_activities["NaceVersion"] == main_activities["max_version"]]

        # group all activities as a list per company
        nace_activiteiten = main_activities.groupby("enterprise_number")["nace_str"].apply(list).reset_index()
        nace_activiteiten.rename(columns={"nace_str": "nace_activiteiten"}, inplace=True)

        # merge everything on enterprise_number
        result = enterprise[["enterprise_number", "JuridicalForm", "StartDate"]]
        result.rename(columns={"JuridicalForm": "juridical_form", "StartDate": "start_date"}, inplace=True)

        result = result.merge(naam, on="enterprise_number", how="left")
        missing_name = result["naam"].isna()
        result_no_name = result[missing_name].drop(columns=["naam"]).merge(fallback, on="enterprise_number", how="left")
        result.loc[missing_name, "naam"] = result_no_name["naam"].values

        result = result.merge(addr, on="enterprise_number", how="left")
        result = result.merge(email, on="enterprise_number", how="left")
        result = result.merge(tel, on="enterprise_number", how="left")
        result = result.merge(nace_activiteiten, on="enterprise_number", how="left")

        return result

    def upload_to_api(self, api_url: str, batch_size: int = 100):
        df = self.combine_df()

        # filter out companies with no NACE activities before uploading
        before_count = len(df)
        df = df[df["nace_activiteiten"].apply(lambda x: isinstance(x, list) and len(x) > 0)]
        skipped_nace = before_count - len(df)
        print(f"NACE filter: {skipped_nace} companies skipped (no activities), {len(df)} remaining")

        df = df.replace({np.nan: None})

        cols = [
            "enterprise_number", "naam", "juridical_form", "start_date",
            "postcode", "gemeente", "straat", "huisnummer",
            "email", "telefoonnummer", "nace_activiteiten"
        ]

        records = df[cols].to_dict(orient="records")

        total_inserted = 0
        total_skipped = 0
        total_failed = 0

        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                response = requests.post(api_url, json={"companies": batch})
                response.raise_for_status()
                result = response.json()
                total_inserted += result.get("inserted", 0)
                total_skipped += result.get("skipped", 0)
                print(f"Batch {i // batch_size + 1}: {result.get('inserted')} inserted, {result.get('skipped')} skipped")
            except Exception as e:
                total_failed += 1
                print(f"Batch {i // batch_size + 1} failed: {e}")

        print(f"\nDone: {total_inserted} inserted, {total_skipped} skipped, {total_failed} batches failed")


if __name__ == "__main__":
    kbo = KBO()
    kbo.print_data()

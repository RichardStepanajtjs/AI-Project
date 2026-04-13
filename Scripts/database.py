from sqlalchemy import MetaData, Table
from sqlalchemy.dialects.postgresql import insert


class Database:
    def __init__(self, engine):
        self.engine = engine
        metadata = MetaData()
        self.vacatures_tabel = Table("vacancies", metadata, autoload_with=engine)
        self.bedrijfsprofielen_tabel = Table("companies", metadata, autoload_with=engine)

    def save_vacatures(self, vacatures):
        with self.engine.connect() as conn:
            for v in vacatures:
                row = {
                    "vdab_referentie": v.get("vacatureReferentie", {}).get("vdabReferentie"),
                    "interne_referentie": v.get("vacatureReferentie", {}).get("interneReferentie"),
                    "kbo_nummer": v.get("leverancier", {}).get("kboNummer"),
                    "leverancier_naam": v.get("leverancier", {}).get("naam"),
                    "leverancier_type": v.get("leverancier", {}).get("type"),
                    "postcode": v.get("tewerkstellingsadres", {}).get("postcode"),
                    "gemeente": v.get("tewerkstellingsadres", {}).get("gemeente"),
                    "land_code": v.get("tewerkstellingsadres", {}).get("landCode"),
                    "beroepsprofiel_code": v.get("functie", {}).get("beroepsprofiel", {}).get("code"),
                    "beroepsprofiel_label": v.get("functie", {}).get("beroepsprofiel", {}).get("label"),
                    "vereisten": [x.get("label", "") for x in v.get("profiel", {}).get("vereisten", [])],
                }
                try:
                    conn.execute(
                        insert(self.vacatures_tabel)
                        .values(row)
                        .on_conflict_do_nothing(index_elements=["interne_referentie"])
                    )
                    conn.commit()

                except Exception as e:
                    print(f"Database error (vacature): {e}")
                    conn.rollback()

    def save_profiel(self, profiel):
        with self.engine.connect() as conn:
            try:
                row = {
                    "kbonummer": profiel["kbo_nummer"],
                    "naam": profiel["naam"],
                    "postcode": profiel["postcode"],
                    "gemeente": profiel["gemeente"],
                    "jobdomein": profiel["jobdomein"],
                    "technologies": profiel["technologies"],
                    "text": profiel["text"],
                    "embedding": profiel["embedding"],
                }
                conn.execute(
                    insert(self.bedrijfsprofielen_tabel)
                    .values(row)
                    .on_conflict_do_update(
                        index_elements=["kbonummer"],
                        set_={
                            "naam": row["naam"],
                            "jobdomein": row["jobdomein"],
                            "technologies": row["technologies"],
                            "text": row["text"],
                            "embedding": row["embedding"],
                        }
                    )
                )
                conn.commit()
                print(f"Saved: {profiel['naam']}")
            except Exception as e:
                print(f"[Database error (profiel) {profiel['kbo_nummer']}]: {e}")
                conn.rollback()
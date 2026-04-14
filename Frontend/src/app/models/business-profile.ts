export interface BusinessProfile {
    id?: number,
    naam: string,
    kbonummer: string,
    postcode: string,
    gemeente: string,
    landcode: string,
    email: string,
    telefoonnummer: string,
    jobdomein: string,
    technologies?: string[],
    text: string,
    created_at: string
}

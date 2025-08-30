use clap::Parser;

/// Simple CLI to compute annuity mortgage totals
#[derive(Parser, Debug)]
#[command(name = "hypotheek-cli", version, about)]
struct Args {
    /// Principal / loan amount (e.g. 670000)
    lening: f64,
    /// Yearly interest rate as percentage (e.g. 4.32 = 4.32%)
    rente: f64,
    /// Duration in years (e.g. 30)
    looptijd_jaren: u32,
    /// Yearly inflation rate as percentage (e.g. 2 = 2%)
    inflatie: f64,
    /// Years of mortgage interest deduction (HRA) (e.g. 10)
    hra_jaren: u32,
    /// Income tax rate for HRA benefit as percentage (e.g. 36.93 = 36.93%)
    belastingtarief: f64,
}

fn normalize_rate(x: f64) -> f64 {
    x / 100.0
}

fn main() {
    let args = Args::parse();

    let rente = normalize_rate(args.rente);
    let inflatie = normalize_rate(args.inflatie);
    let belastingtarief = normalize_rate(args.belastingtarief);

    bereken_hypotheek(
        args.lening,
        rente,
        args.looptijd_jaren,
        inflatie,
        args.hra_jaren,
        belastingtarief,
    );
}

fn bereken_hypotheek(lening: f64, rente: f64, looptijd_jaren: u32, inflatie: f64, hra_jaren: u32, belastingtarief: f64) {
    let n_maanden = looptijd_jaren * 12;
    let rente_m = rente / 12.0;

    // Nominale maandlast (annuïteit)
    let annuiteit = lening * rente_m / (1.0 - (1.0 + rente_m).powi(-(n_maanden as i32)));

    let mut schuld = lening;
    let mut totaal_nominaal = 0.0;
    let mut totaal_reel = 0.0;

    for maand in 1..=n_maanden {
        let rente_betaling = schuld * rente_m;
        let aflossing = annuiteit - rente_betaling;

        // Hypotheekrenteaftrek alleen in eerste hra_jaren
        let mut netto_betaling = annuiteit;
        if maand <= hra_jaren * 12 {
            let belasting_voordeel = rente_betaling * belastingtarief;
            netto_betaling -= belasting_voordeel;
        }

        // contant maken naar vandaag (inflatie-discount)
        let jaren = maand as f64 / 12.0;
        let discount_factor = (1.0 + inflatie).powf(jaren);
        let reel_betaling = netto_betaling / discount_factor;

        totaal_nominaal += netto_betaling;
        totaal_reel += reel_betaling;

        schuld -= aflossing;
    }

    let verschil_nominaal = totaal_nominaal - lening;
    let verschil_reel = totaal_reel - lening;

    println!("=== Hypotheekberekening met HRA ===");
    println!("Lening: {}", format_euro(lening));
    println!("Rente: {:.2}%", rente * 100.0);
    println!("Inflatie: {:.2}%", inflatie * 100.0);
    println!("Looptijd: {} jaar", looptijd_jaren);
    println!("Hypotheekrenteaftrek: {} jaar, tarief {:.1}%", hra_jaren, belastingtarief * 100.0);
    println!();
    println!("Vaste bruto maandlast: {}", format_euro(annuiteit));
    println!("Totaal betaald (nominaal, na HRA): {}", format_euro(totaal_nominaal));
    println!("Totaal betaald (in euro's van vandaag): {}", format_euro(totaal_reel));
    println!();
    println!(
        "Extra kosten boven lening (nominaal): {} (≈ {}/mnd)",
        format_euro(verschil_nominaal),
        format_euro(verschil_nominaal / n_maanden as f64)
    );
    println!(
        "Extra kosten boven lening (in euro's van vandaag): {} (≈ {}/mnd)",
        format_euro(verschil_reel),
        format_euro(verschil_reel / n_maanden as f64)
    );
    println!();
    println!("DISCLAIMER: Dit is geen financieel advies. Deze berekening is uitsluitend");
    println!("bedoeld voor educatieve en informatieve doeleinden. De resultaten zijn");
    println!("hypothetisch en de nauwkeurigheid wordt niet gegarandeerd. Raadpleeg");
    println!("altijd een financieel adviseur of hypotheekspecialist voor persoonlijk");
    println!("advies. De maker neemt geen verantwoordelijkheid voor beslissingen");
    println!("gebaseerd op deze tool.");
}

fn format_euro(bedrag: f64) -> String {
    let afgerond = bedrag.round() as i64;
    let s = afgerond.abs().to_string();

    // voeg puntjes als duizendtalseparator
    let mut with_sep = String::new();
    for (i, c) in s.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            with_sep.push('.');
        }
        with_sep.push(c);
    }
    let mut int_formatted: String = with_sep.chars().rev().collect();

    if bedrag.is_sign_negative() {
        int_formatted = format!("-{}", int_formatted);
    }

    format!("€{}", int_formatted)
}

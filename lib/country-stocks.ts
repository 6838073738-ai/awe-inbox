// Curated top-3 stock tickers per country (Yahoo Finance format).
// For countries without a developed public equity market, we fall back to
// World Bank macro indicators on the detail page instead of pretending.
//
// Tickers verified against Yahoo Finance symbology as of 2026-05.
// Exchange suffixes: .L (LSE), .TO (TSX), .DE (XETRA), .PA (EPA), .MI (BIT),
// .MC (BME), .AS (AMS), .SW (SIX), .ST (Stockholm), .OL (Oslo), .CO (CSE),
// .HE (Helsinki), .WA (Warsaw), .T (TSE Tokyo), .HK, .KS (KRX), .TW (TWSE),
// .NS (NSE India), .BK (SET Thailand), .KL (Bursa Malaysia), .JK (IDX),
// .SI (SGX), .AX (ASX), .NZ (NZX), .JO (JSE), .SA (B3 Brazil), .MX (BMV),
// .SR (Tadawul), .TA (TASE), .CA (EGX), .LG (NGX).

export const COUNTRY_STOCKS: Record<string, string[]> = {
  // North America
  US: ["AAPL", "MSFT", "NVDA"],
  CA: ["RY.TO", "TD.TO", "ENB.TO"],
  MX: ["WALMEX.MX", "GMEXICOB.MX", "FEMSAUBD.MX"],
  // South America
  BR: ["PETR4.SA", "VALE3.SA", "ITUB4.SA"],
  AR: ["GGAL.BA", "YPFD.BA", "PAMP.BA"],
  CL: ["SQM-B.SN", "FALABELLA.SN", "ENELCHILE.SN"],
  CO: ["ECOPETROL.CL", "GRUPOAVAL.CL"],
  PE: ["CREDITC1.LM", "BAP"],
  // Europe — UK & Ireland
  GB: ["SHEL.L", "AZN.L", "HSBA.L"],
  IE: ["RYA.IR", "BIRG.IR"],
  // Europe — Continent
  DE: ["SAP.DE", "SIE.DE", "ALV.DE"],
  FR: ["MC.PA", "OR.PA", "TTE.PA"],
  IT: ["ENI.MI", "ISP.MI", "ENEL.MI"],
  ES: ["IBE.MC", "SAN.MC", "ITX.MC"],
  NL: ["ASML.AS", "INGA.AS", "PRX.AS"],
  CH: ["NESN.SW", "ROG.SW", "NOVN.SW"],
  SE: ["VOLV-B.ST", "ATCO-A.ST", "ERIC-B.ST"],
  NO: ["EQNR.OL", "DNB.OL", "TEL.OL"],
  DK: ["NOVO-B.CO", "MAERSK-B.CO", "DSV.CO"],
  FI: ["NOKIA.HE", "KNEBV.HE", "NESTE.HE"],
  BE: ["ABI.BR", "KBC.BR", "UCB.BR"],
  AT: ["OMV.VI", "EBS.VI"],
  PL: ["PKO.WA", "PKN.WA", "PEO.WA"],
  CZ: ["CEZ.PR"],
  HU: ["OTP.BD", "MOL.BD"],
  GR: ["ETE.AT", "OPAP.AT"],
  PT: ["EDP.LS", "GALP.LS"],
  TR: ["AKBNK.IS", "GARAN.IS", "THYAO.IS"],
  RU: ["GAZP.ME", "SBER.ME", "LKOH.ME"],
  // Asia — East
  JP: ["7203.T", "6758.T", "9984.T"],
  CN: ["BABA", "PDD", "JD"],
  HK: ["0700.HK", "9988.HK", "0005.HK"],
  TW: ["2330.TW", "2317.TW", "2454.TW"],
  KR: ["005930.KS", "000660.KS", "035420.KS"],
  // Asia — South
  IN: ["RELIANCE.NS", "TCS.NS", "INFY.NS"],
  PK: ["OGDC.KA", "HBL.KA"],
  BD: ["BEXIMCO.DH"],
  LK: ["JKH.N0000.CM"],
  // Asia — Southeast
  SG: ["D05.SI", "O39.SI", "Z74.SI"],
  TH: ["PTT.BK", "AOT.BK", "CPALL.BK"],
  MY: ["1155.KL", "5347.KL", "3816.KL"],
  ID: ["BBCA.JK", "BBRI.JK", "TLKM.JK"],
  PH: ["SM.PS", "BDO.PS", "ALI.PS"],
  VN: ["VIC.VN", "VHM.VN", "VCB.VN"],
  // Middle East
  AE: ["EMAAR.AE", "ETISALAT.AE"],
  SA: ["2222.SR", "1180.SR", "7010.SR"],
  IL: ["TEVA.TA", "BANK.TA", "POLI.TA"],
  QA: ["QNBK.QA", "IQCD.QA"],
  KW: ["NBK.KW"],
  // Africa
  ZA: ["NPN.JO", "SOL.JO", "BHG.JO"],
  EG: ["COMI.CA", "HRHO.CA"],
  NG: ["DANGCEM.LG", "MTNN.LG"],
  KE: ["SCOM.NR", "EQTY.NR"],
  MA: ["IAM.CS", "ATW.CS"],
  // Oceania
  AU: ["BHP.AX", "CBA.AX", "CSL.AX"],
  NZ: ["FPH.NZ", "MEL.NZ"],
};

export function getStockTickers(iso2: string): string[] {
  return COUNTRY_STOCKS[iso2.toUpperCase()] ?? [];
}

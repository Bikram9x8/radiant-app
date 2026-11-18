import s from "./abroad.module.css";

// "Your path abroad": six stamps from first search to the flight. Guidance text only, no facts.
const STEPS = [
  { title: "Shortlist", text: "Countries, courses and budget" },
  { title: "Take the exams", text: "IELTS or PTE, plus GRE, GMAT or SAT if needed" },
  { title: "Apply", text: "SOP, LORs, transcripts, portfolio" },
  { title: "Get the offer", text: "Accept it and pay the deposit" },
  { title: "Visa", text: "Proof of funds, medicals, biometrics" },
  { title: "Fly", text: "Accommodation, forex, insurance" },
];

export default function PathStamps() {
  return (
    <ol className={s.path}>
      {STEPS.map((st, i) => (
        <li key={st.title} className={i === STEPS.length - 1 ? s.pathLast : undefined}>
          <b>{st.title}</b>
          <span>{st.text}</span>
        </li>
      ))}
    </ol>
  );
}

import s from "./landing.module.css";

const TYPES = [
  ["Builder", "Engineering, design"],
  ["Thinker", "Science, data"],
  ["Creator", "Media, arts"],
  ["Helper", "Medicine, teaching"],
  ["Leader", "Business, law"],
  ["Organiser", "Finance, admin"],
];

// The career test isn't built yet: no button, a "Coming soon" tag instead
export default function CareerBlock() {
  return (
    <div className={s.wrap}>
      <section className={`${s.sticker} ${s.career}`} aria-labelledby="home-career">
        <div>
          <h2 id="home-career" className={s.h2}>
            Which career <span className={s.ser}>suits you?</span>
          </h2>
          <p className={s.lead}>
            Answer 30 quick questions and find your career type, the courses that match it and the colleges that
            offer them. Free, in 10 minutes.
          </p>
          <p className={s.careerSoon}>
            <span className={`${s.tag} ${s.soon}`}>Coming soon</span>
            The free career test is on its way.
          </p>
        </div>
        <ul className={s.types} aria-label="Career types">
          {TYPES.map(([name, fields]) => (
            <li key={name}>
              {name}
              <small>{fields}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

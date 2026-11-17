import Link from "next/link";
import s from "./landing.module.css";

export default function JoinBanner() {
  return (
    <div className={s.wrap}>
      <section className={`${s.sticker} ${s.join}`} aria-labelledby="home-join">
        <h2 id="home-join" className={s.h2}>
          Join free and track your <span className={s.ser}>prep.</span>
        </h2>
        {/* Soft navigation to /signup opens the existing signup modal */}
        <Link href="/signup" className={`${s.btn} ${s.dark}`}>
          Create my free account
        </Link>
      </section>
    </div>
  );
}

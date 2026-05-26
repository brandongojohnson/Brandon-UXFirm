import './EditorsPicks.css'

const picks = [
  {
    num: '01',
    tag: 'ESSAY // METHODS',
    title: 'The Quiet Signal in Noisy Data',
    desc: 'How to extract signal from high-volume qualitative datasets using a structured affinity mapping process.',
    readTime: '8 min read',
  },
  {
    num: '02',
    tag: 'CASE // ENTERPRISE',
    title: 'Redesigning the Researcher Role',
    desc: 'A study in organizational transformation: embedding UX research into product culture at scale.',
    readTime: '12 min read',
  },
  {
    num: '03',
    tag: 'INTERVIEW // PRACTICE',
    title: 'What Observational Depth Demands',
    desc: 'A dialogue with three senior strategists on the limits and possibilities of remote fieldwork.',
    readTime: '6 min read',
  },
]

export default function EditorsPicks() {
  return (
    <section className="picks">
      <div className="picks__inner">
        <div className="picks__header">
          <h2 className="picks__title">Editor's Picks</h2>
          <span className="picks__volume">VOLUME 12 — WINTER 24</span>
        </div>
        <div className="picks__grid">
          {picks.map((pick) => (
            <article className="pick-card" key={pick.title}>
              <div className="pick-card__header">
                <span className="pick-card__tag">{pick.tag}</span>
                <span className="pick-card__num">{pick.num}</span>
              </div>
              <div className="pick-card__body">
                <h3 className="pick-card__title">{pick.title}</h3>
                <p className="pick-card__desc">{pick.desc}</p>
              </div>
              <div className="pick-card__footer">
                <span className="pick-card__read-time">{pick.readTime}</span>
                <a href="#" className="pick-card__link">READ →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

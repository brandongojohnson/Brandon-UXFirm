import './QuoteSections.css'

export default function QuoteSections() {
  return (
    <>
      <section className="quote quote--light">
        <div className="quote__inner">
          <span className="quote__mark" aria-hidden="true">"</span>
          <blockquote className="quote__text">
            Precision is not just a measure of distance, but a depth of understanding.
            Methodic seeks the quiet between the data points.
          </blockquote>
          <div className="quote__meta">
            <div className="quote__rule" aria-hidden="true" />
            <cite className="quote__cite">E. Vance, Lead Strategist</cite>
          </div>
        </div>
      </section>

      <section className="quote quote--dark">
        <div className="quote__inner">
          <span className="quote__mark quote__mark--dark" aria-hidden="true">"</span>
          <blockquote className="quote__text quote__text--large">
            "We believe the most valuable data points occur in the silence between actions."
          </blockquote>
          <p className="quote__body">
            Cultivate a resolute research culture focused on the practice of multisensory
            logic. We use disciplined process. We find the dots and subscribe to the life
            of the world's most meticulous design stories.
          </p>
        </div>
      </section>
    </>
  )
}

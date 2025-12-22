const { useState, useEffect } = React

function ContactFormReact(){
  const [form, setForm] = useState({
    fullName: '', email: '', age: '', urgency: '', issueType: '',
    questionDetails: '', featureDetails: '', feedback: ''
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(()=>{
    // hide original non-react form while React is mounted
    const original = document.getElementById('contactForm')
    if (original) {
      original.style.display = 'none'
      original.setAttribute('aria-hidden', 'true')
    }
    return () => {
      if (original) {
        original.style.display = ''
        original.removeAttribute('aria-hidden')
      }
    }
  }, [])

  function update(field, value){
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e){
    e.preventDefault()
    // basic validation
    if (!form.fullName.trim() || !form.email.trim()){
      const err = document.getElementById('formError')
      if (err) err.style.display = 'block'
      return
    }
    // hide any prior error
    const err = document.getElementById('formError')
    if (err) err.style.display = 'none'

    // show success banner if exists, otherwise show local message
    const success = document.getElementById('formSuccess')
    if (success) success.style.display = 'block'
    setSubmitted(true)

    // simulate async submission and clear form after a short delay
    setTimeout(()=>{
      setForm({ fullName:'', email:'', age:'', urgency:'', issueType:'', questionDetails:'', featureDetails:'', feedback:'' })
    }, 800)
  }

  const charCount = (s) => (s || '').length

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate aria-describedby="formHelp">
      <p id="formHelp" className="form-help">Fields marked * are required.</p>

      <fieldset className="form-fieldset">
        <legend className="fieldset-legend"><i className="fas fa-user-circle"></i>Personal Information</legend>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name * <span className="label-hint">Minimum 2 characters</span></label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input className="form-input" value={form.fullName} onChange={e=>update('fullName', e.target.value)} required minLength={2} placeholder="Jane Doe" />
            </div>
            <div className="input-feedback"></div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input className="form-input" type="email" value={form.email} onChange={e=>update('email', e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="input-feedback"></div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age <span className="label-hint">Optional</span></label>
            <div className="input-with-icon">
              <i className="fas fa-birthday-cake"></i>
              <input className="form-input" type="number" value={form.age} onChange={e=>update('age', e.target.value)} min={13} max={120} placeholder="18" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Urgency *</label>
            <div className="select-with-icon">
              <i className="fas fa-clock"></i>
              <select className="form-input" value={form.urgency} onChange={e=>update('urgency', e.target.value)} required>
                <option value="" disabled>Select urgency level</option>
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Need assistance</option>
                <option value="high">High - Urgent issue</option>
              </select>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend className="fieldset-legend"><i className="fas fa-headset"></i>Support Details</legend>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Issue Type *</label>
            <div className="issue-type-buttons">
              <div className="issue-button">
                <input type="radio" id="r_question" name="reactIssueType" value="question" checked={form.issueType==='question'} onChange={e=>update('issueType', e.target.value)} required={!form.issueType} />
                <label htmlFor="r_question"><i className="fas fa-question-circle"></i><span>Question</span></label>
              </div>
              <div className="issue-button">
                <input type="radio" id="r_feature" name="reactIssueType" value="feature" checked={form.issueType==='feature'} onChange={e=>update('issueType', e.target.value)} />
                <label htmlFor="r_feature"><i className="fas fa-lightbulb"></i><span>Feature Request</span></label>
              </div>
            </div>
          </div>
        </div>

        {form.issueType === 'question' && (
          <div className="issue-details-row">
            <div className="form-group">
              <label className="form-label">Your Question *</label>
              <div className="input-with-icon">
                <i className="fas fa-comment-alt"></i>
                <textarea className="form-input" value={form.questionDetails} onChange={e=>update('questionDetails', e.target.value)} maxLength={1000} rows={4} placeholder="Describe your question..."></textarea>
              </div>
              <div className="char-counter"><span>{charCount(form.questionDetails)}</span>/1000 characters</div>
            </div>
          </div>
        )}

        {form.issueType === 'feature' && (
          <div className="issue-details-row">
            <div className="form-group">
              <label className="form-label">Your Feature Request *</label>
              <div className="input-with-icon">
                <i className="fas fa-lightbulb"></i>
                <textarea className="form-input" value={form.featureDetails} onChange={e=>update('featureDetails', e.target.value)} maxLength={1000} rows={4} placeholder="Describe the feature..."></textarea>
              </div>
              <div className="char-counter"><span>{charCount(form.featureDetails)}</span>/1000 characters</div>
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="form-fieldset">
        <legend className="fieldset-legend"><i className="fas fa-comment-dots"></i>Additional Feedback</legend>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Feedback <span className="label-hint">Optional</span></label>
            <div className="input-with-icon">
              <i className="fas fa-pen"></i>
              <textarea className="form-input" value={form.feedback} onChange={e=>update('feedback', e.target.value)} maxLength={1000} rows={4} placeholder="Any other comments..."></textarea>
            </div>
            <div className="char-counter"><span>{charCount(form.feedback)}</span>/1000 characters</div>
          </div>
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="submit-btn"><i className="fas fa-paper-plane"></i>Submit Feedback</button>
      </div>
    </form>
  )
}

// mount safely if element exists
document.addEventListener('DOMContentLoaded', function(){
  const mount = document.getElementById('contactReactRoot')
  if (!mount) return
  ReactDOM.createRoot(mount).render(React.createElement(ContactFormReact))
})

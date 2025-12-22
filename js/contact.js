

document.addEventListener('DOMContentLoaded', function() {
  // If React successfully renders into the mount, skip vanilla logic; otherwise fall back to vanilla.
  const reactMount = document.getElementById('contactReactRoot');
  if (reactMount && reactMount.childNodes.length > 0) return;

  // DOM Elements
  const contactForm = document.getElementById('contactForm');
  const successBanner = document.getElementById('formSuccess');
  const errorBanner = document.getElementById('formError');
  const questionRow = document.getElementById('questionDetailsRow');
  const featureRow = document.getElementById('featureDetailsRow');
  const questionField = document.getElementById('questionDetails');
  const featureField = document.getElementById('featureDetails');
  const feedbackField = document.getElementById('feedback');
  
  // Character counters
  const questionCharCount = document.getElementById('questionCharCount');
  const featureCharCount = document.getElementById('featureCharCount');
  const feedbackCharCount = document.getElementById('feedbackCharCount');
  
  // Initialize
  initContactForm();
  
  function initContactForm() {
    // Setup radio button functionality
    setupRadioButtons();
    
    // Setup character counters
    setupCharacterCounters();
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup real-time validation
    setupRealTimeValidation();
  }
  
  function setupRadioButtons() {
    const questionRadio = document.getElementById('issue_question');
    const featureRadio = document.getElementById('issue_feature');
    
    function updateIssueDetails() {
      // Hide both rows first
      questionRow.style.display = 'none';
      featureRow.style.display = 'none';
      
      // Remove required attribute
      questionField.required = false;
      featureField.required = false;
      
      // Show appropriate row and set required
      if (questionRadio.checked) {
        questionRow.style.display = 'block';
        questionField.required = true;
        // Trigger input event to update char count
        questionField.dispatchEvent(new Event('input'));
      } else if (featureRadio.checked) {
        featureRow.style.display = 'block';
        featureField.required = true;
        // Trigger input event to update char count
        featureField.dispatchEvent(new Event('input'));
      }
    }
    
    // Add event listeners
    if (questionRadio) questionRadio.addEventListener('change', updateIssueDetails);
    if (featureRadio) featureRadio.addEventListener('change', updateIssueDetails);
    
    // Initial update
    updateIssueDetails();
  }
  
  function setupCharacterCounters() {
    // Question field counter
    if (questionField && questionCharCount) {
      questionField.addEventListener('input', function() {
        questionCharCount.textContent = this.value.length;
      });
      // Initialize
      questionCharCount.textContent = questionField.value.length;
    }
    
    // Feature field counter
    if (featureField && featureCharCount) {
      featureField.addEventListener('input', function() {
        featureCharCount.textContent = this.value.length;
      });
      // Initialize
      featureCharCount.textContent = featureField.value.length;
    }
    
    // Feedback field counter
    if (feedbackField && feedbackCharCount) {
      feedbackField.addEventListener('input', function() {
        feedbackCharCount.textContent = this.value.length;
      });
      // Initialize
      feedbackCharCount.textContent = feedbackField.value.length;
    }
  }
  
  function setupFormSubmission() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Hide previous messages
      hideMessages();
      
      // Validate form
      if (validateForm()) {
        // Show loading state on button
        const submitBtn = this.querySelector('.submit-btn');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual fetch/AJAX)
        setTimeout(() => {
          // Reset button
          submitBtn.innerHTML = originalHtml;
          submitBtn.disabled = false;
          
          // Show success message
          showSuccess();
          
          // Reset form
          contactForm.reset();
          
          // Reset character counters
          if (questionCharCount) questionCharCount.textContent = '0';
          if (featureCharCount) featureCharCount.textContent = '0';
          if (feedbackCharCount) feedbackCharCount.textContent = '0';
          
          // Reset issue details visibility
          const questionRadio = document.getElementById('issue_question');
          const featureRadio = document.getElementById('issue_feature');
          if (questionRadio) questionRadio.checked = false;
          if (featureRadio) featureRadio.checked = false;
          
          // Hide issue details
          questionRow.style.display = 'none';
          featureRow.style.display = 'none';
          questionField.required = false;
          featureField.required = false;
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      } else {
        showError('Please check the highlighted fields.');
        // Scroll to first error
        const firstError = contactForm.querySelector('.form-input:invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    });
  }
  
  function setupRealTimeValidation() {
    // Name field validation
    const nameField = document.getElementById('fullName');
    if (nameField) {
      nameField.addEventListener('blur', validateName);
      nameField.addEventListener('input', clearNameError);
    }
    
    // Email field validation
    const emailField = document.getElementById('email');
    if (emailField) {
      emailField.addEventListener('blur', validateEmail);
      emailField.addEventListener('input', clearEmailError);
    }
  }
  
  function validateName() {
    const field = document.getElementById('fullName');
    const feedback = field.closest('.form-group')?.querySelector('.input-feedback');
    
    if (!field.value.trim()) {
      field.style.borderColor = '#dc3545';
      if (feedback) feedback.textContent = 'Name is required';
      return false;
    }
    
    if (field.value.length < 2) {
      field.style.borderColor = '#dc3545';
      if (feedback) feedback.textContent = 'Name must be at least 2 characters';
      return false;
    }
    
    if (!field.value.match(/^[A-Za-z\s.'-]+$/)) {
      field.style.borderColor = '#dc3545';
      if (feedback) feedback.textContent = 'Only letters, spaces, and basic punctuation allowed';
      return false;
    }
    
    field.style.borderColor = '';
    if (feedback) feedback.textContent = '';
    return true;
  }
  
  function clearNameError() {
    const field = document.getElementById('fullName');
    const feedback = field.closest('.form-group')?.querySelector('.input-feedback');
    field.style.borderColor = '';
    if (feedback) feedback.textContent = '';
  }
  
  function validateEmail() {
    const field = document.getElementById('email');
    const feedback = field.closest('.form-group')?.querySelector('.input-feedback');
    
    if (!field.value.trim()) {
      field.style.borderColor = '#dc3545';
      if (feedback) feedback.textContent = 'Email is required';
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      field.style.borderColor = '#dc3545';
      if (feedback) feedback.textContent = 'Please enter a valid email address';
      return false;
    }
    
    field.style.borderColor = '';
    if (feedback) feedback.textContent = '';
    return true;
  }
  
  function clearEmailError() {
    const field = document.getElementById('email');
    const feedback = field.closest('.form-group')?.querySelector('.input-feedback');
    field.style.borderColor = '';
    if (feedback) feedback.textContent = '';
  }
  
  function validateForm() {
    let isValid = true;
    
    // Validate name
    if (!validateName()) isValid = false;
    
    // Validate email
    if (!validateEmail()) isValid = false;
    
    // Validate urgency
    const urgencyField = document.getElementById('urgency');
    const urgencyGroup = urgencyField?.closest('.form-group');
    if (urgencyField && !urgencyField.value) {
      urgencyField.style.borderColor = '#dc3545';
      isValid = false;
    } else if (urgencyField) {
      urgencyField.style.borderColor = '';
    }
    
    // Validate issue type
    const issueType = document.querySelector('input[name="issueType"]:checked');
    const issueTypeGroup = document.querySelector('.issue-type-buttons')?.closest('.form-group');
    if (!issueType) {
      if (issueTypeGroup) issueTypeGroup.style.border = '2px solid #dc3545';
      isValid = false;
    } else {
      if (issueTypeGroup) issueTypeGroup.style.border = '';
      
      // Validate details based on issue type
      if (issueType.value === 'question') {
        if (!questionField.value.trim()) {
          questionField.style.borderColor = '#dc3545';
          isValid = false;
        } else {
          questionField.style.borderColor = '';
        }
      } else if (issueType.value === 'feature') {
        if (!featureField.value.trim()) {
          featureField.style.borderColor = '#dc3545';
          isValid = false;
        } else {
          featureField.style.borderColor = '';
        }
      }
    }
    
    return isValid;
  }
  
  function showSuccess(message = 'Thanks for your feedback! We\'ll get back to you soon.') {
    if (successBanner) {
      successBanner.querySelector('span').textContent = message;
      successBanner.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        successBanner.style.display = 'none';
      }, 5000);
    }
  }
  
  function showError(message = 'Please check the highlighted fields.') {
    if (errorBanner) {
      errorBanner.querySelector('span').textContent = message;
      errorBanner.style.display = 'block';
    }
  }
  
  function hideMessages() {
    if (successBanner) successBanner.style.display = 'none';
    if (errorBanner) errorBanner.style.display = 'none';
  }
});
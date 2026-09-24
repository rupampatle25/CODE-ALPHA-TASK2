(function () {
  const currentScript = document.currentScript;
  const publicId = currentScript ? (currentScript.getAttribute('data-public-id') || 'tn-public-bot-982') : 'tn-public-bot-982';
  const scriptSrc = currentScript ? currentScript.src : window.location.origin;
  const urlObj = new URL(scriptSrc);
  const baseUrl = urlObj.origin;

  // Create launcher button
  const button = document.createElement('div');
  button.id = 'faqpilot-widget-button';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #2563EB;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  // Create iframe container
  const container = document.createElement('div');
  container.id = 'faqpilot-widget-container';
  container.style.cssText = `
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 400px;
    max-width: calc(100vw - 48px);
    height: 620px;
    max-height: calc(100vh - 120px);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    z-index: 999999;
    display: none;
    border: 1px solid rgba(226, 232, 240, 0.8);
    background: #ffffff;
    transition: all 0.25s ease-in-out;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/widget/${publicId}`;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;

  container.appendChild(iframe);
  document.body.appendChild(button);
  document.body.appendChild(container);

  let isOpen = false;
  button.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.display = 'block';
      button.style.transform = 'scale(0.92)';
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      container.style.display = 'none';
      button.style.transform = 'scale(1)';
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }
  });
})();

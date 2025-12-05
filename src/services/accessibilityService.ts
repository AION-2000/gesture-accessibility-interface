// Utility functions for managing accessibility features

/**
 * Checks if the user prefers reduced motion.
 * @returns {boolean} True if the user prefers reduced motion.
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Checks if the user prefers high contrast.
 * @returns {boolean} True if the user prefers high contrast.
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * A simple class to manage ARIA live announcements.
 */
class AriaAnnouncer {
  private announcerElement: HTMLElement | null = null;

  constructor() {
    this.createAnnouncerElement();
  }

  private createAnnouncerElement = () => {
    if (this.announcerElement) return;

    this.announcerElement = document.createElement('div');
    this.announcerElement.setAttribute('aria-live', 'polite');
    this.announcerElement.setAttribute('aria-atomic', 'true');
    // Hide the element visually but keep it accessible to screen readers
    this.announcerElement.style.position = 'absolute';
    this.announcerElement.style.left = '-10000px';
    this.announcerElement.style.width = '1px';
    this.announcerElement.style.height = '1px';
    this.announcerElement.style.overflow = 'hidden';
    document.body.appendChild(this.announcerElement);
  };

  /**
   * Announces a message to screen readers.
   * @param {string} message The message to announce.
   * @param {'polite' | 'assertive'} politeness The politeness level of the announcement.
   */
  announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (!this.announcerElement) {
      this.createAnnouncerElement();
    }

    if (this.announcerElement) {
      this.announcerElement.setAttribute('aria-live', politeness);
      // Clear the content first to ensure the announcement is read even if the message is the same
      this.announcerElement.textContent = '';
      // Use a small timeout to ensure the screen reader registers the change
      setTimeout(() => {
        if (this.announcerElement) {
          this.announcerElement.textContent = message;
        }
      }, 100);
    }
  };

  /**
   * Cleans up the announcer element from the DOM.
   */
  destroy = () => {
    if (this.announcerElement && this.announcerElement.parentNode) {
      this.announcerElement.parentNode.removeChild(this.announcerElement);
      this.announcerElement = null;
    }
  };
}

// Create a singleton instance of the announcer
const announcer = new AriaAnnouncer();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  announcer.destroy();
});

/**
 * Announces a message to screen readers using the singleton announcer.
 * @param {string} message The message to announce.
 * @param {'polite' | 'assertive'} politeness The politeness level of the announcement.
 */
export const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  announcer.announce(message, politeness);
};

/**
 * Focuses an element and scrolls it into view.
 * @param {HTMLElement | null} element The element to focus.
 */
export const focusElement = (element: HTMLElement | null) => {
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// Export the announcer instance for advanced usage if needed
export { announcer as ariaAnnouncer };
class NotFoundPage {
    constructor() {
        this._title = 'Page Not Found - StoryApps';
    }

    async render() {
        document.title = this._title;

        return `
      <section class="not-found-page page-transition">
        <div class="not-found-container">
          <div class="not-found-content">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Sorry, the page you are looking for is not available or may have been moved..</p>
            <a href="#/" class="btn btn-primary">Back to Home</a>
          </div>
        </div>
      </section>
    `;
    }

    async afterRender() {
        const notFoundContent = document.querySelector('.not-found-content');
        if (notFoundContent) {
            notFoundContent.classList.add('animate-fade-in');
        }
    }
}

export { NotFoundPage };
import FavoritePresenter from '../../presenters/favorite-presenter.js';

class FavoritePage {
    constructor() {
        this._presenter = new FavoritePresenter(this);
    }

    async render() {
        return `
      <h2>Favorite Stories</h2>
      <div id="favorite-stories-container"></div>
      <div id="favorite-message"></div>
    `;
    }

    async afterRender() {
        await this._presenter.showFavoriteStories();
    }

    renderFavoriteStories(stories) {
        const container = document.getElementById('favorite-stories-container');
        container.innerHTML = '';

        stories.forEach(story => {
            const storyElement = document.createElement('div');
            storyElement.classList.add('story-item');
            storyElement.innerHTML = `
        <h3>${story.title}</h3>
        <p>${story.description}</p>
        <img src="${story.photoUrl}" alt="Story photo" />
        <button data-id="${story.id}" class="remove-favorite-btn">Remove Favorite</button>
      `;
            container.appendChild(storyElement);
        });

        container.querySelectorAll('.remove-favorite-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                this._presenter.removeFavorite(id);
            });
        });

        this._clearMessage();
    }

    showNoFavoritesMessage() {
        const message = document.getElementById('favorite-message');
        message.textContent = 'No favorite stories found.';
        document.getElementById('favorite-stories-container').innerHTML = '';
    }

    showError(msg) {
        const message = document.getElementById('favorite-message');
        message.textContent = `Error: ${msg}`;
    }

    _clearMessage() {
        const message = document.getElementById('favorite-message');
        message.textContent = '';
    }
}

export default FavoritePage;

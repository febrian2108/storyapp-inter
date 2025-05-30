class MapPresenter {
    constructor(config, view) {
        this._config = config;
        this._view = view;
    }

    async getStoriesWithLocation() {
        try {
            this._view.showLoading();

            const stories = await this._config.getStories(1, 100, 1);

            const storiesWithLocation = stories.filter(story => story.lat && story.lon);

            console.log('Stories with location:', storiesWithLocation.length);
            this._view.renderStoriesOnMap(storiesWithLocation);
        } catch (error) {
            console.error('Map presenter error:', error);
            this._view.showError(error.message);
        }
    }
}

export { MapPresenter };
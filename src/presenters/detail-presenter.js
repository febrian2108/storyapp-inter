class DetailPresenter {
    constructor(config, view) {
        this._config = config;
        this._view = view;
    }

    async getStoryDetail(id) {
        try {
            this._view.showLoading();
            const story = await this._config.getStoryDetail(id);
            this._view.renderStoryDetail(story);
        } catch (error) {
            console.error('Detail presenter error:', error);
            this._view.showError(error.message);
        }
    }
}

export { DetailPresenter };
class AddStoryPresenter {
  constructor(config, view) {
    this._config = config;
    this._view = view;
  }

  async addStory(description, photoBlob, lat, lon) {
    try {
      this._view.clearAlert();
      this._view.showLoading();
      
      if (!description) {
        throw new Error('The story description is mandatory');
      }
      
      if (!photoBlob) {
        throw new Error('Photos must be taken');
      }
      
      console.log('Adding story with', lat && lon ? 'location' : 'no location');
      const response = await this._config.addStory(description, photoBlob, lat, lon);
      
      console.log('Story added successfully');
      this._view.showAlert('The story was successfully shared!', 'success');
      
      setTimeout(() => {
        window.location.href = '#/';
      }, 1500);
      
    } catch (error) {
      console.error('Add story presenter error:', error);
      this._view.hideLoading();
      this._view.showAlert(error.message);
    }
  }
}

export { AddStoryPresenter };
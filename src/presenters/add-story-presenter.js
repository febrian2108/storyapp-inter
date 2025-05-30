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

      if (!response.ok && response.status) {
        throw new Error(`Upload story failed with status ${response.status}`);
      }

      console.log('Story added successfully');
      this._view.showAlert('The story was successfully shared!', 'success');

      // Setelah upload sukses, panggil backend untuk mengirim push notification
      await this._sendPushNotification();

      // Redirect ke halaman utama setelah delay
      setTimeout(() => {
        window.location.href = '#/';
      }, 1500);

    } catch (error) {
      console.error('Add story presenter error:', error);
      this._view.hideLoading();
      this._view.showAlert(error.message);
    }
  }

  async _sendPushNotification() {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Story Baru',
          body: 'Ada story baru yang diupload, ayo cek!',
          url: '#/home'
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim notifikasi');
      }

      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}

export { AddStoryPresenter };

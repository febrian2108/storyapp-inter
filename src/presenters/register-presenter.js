class RegisterPresenter {
    constructor(config, view) {
        this._config = config;
        this._view = view;
    }

    async register(name, email, password, confirmPassword) {
        try {
            this._view.clearAlert();
            this._view.showLoading();

            if (!name || !email || !password || !confirmPassword) {
                throw new Error('All fields must be filled in');
            }

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }

            if (password !== confirmPassword) {
                throw new Error('Password and password confirmation do not match');
            }

            console.log('Register validation passed, calling API');
            await this._config.register(name, email, password);

            console.log('Registration successful');
            this._view.showAlert('Registration successful. Please login.', 'success');

            setTimeout(() => {
                window.location.href = '#/login';
            }, 2000);

        } catch (error) {
            console.error('Register presenter error:', error);
            this._view.hideLoading();
            this._view.showAlert(error.message);
        }
    }
}

export { RegisterPresenter };
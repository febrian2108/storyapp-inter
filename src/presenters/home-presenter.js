import Swal from 'sweetalert2';
class HomePresenter {
    constructor(model, view) {
        this._model = model;
        this._view = view;
        this.showWelcomeOnce();
    }

    async getStories() {
        try {
            this._view.showLoading();
            const stories = await this._model.getStories(1, 10, 1);
            this._view.renderStories(stories);
        } catch (error) {
            console.error('Home presenter error:', error);
            this._view.showError(error.message);
        }
    }

    showWelcomeOnce() {
        const alreadyShown = localStorage.getItem('welcomeShown');
        if (!alreadyShown) {
            Swal.fire({
                title: "Welcome to StoryApps!",
                text: "Sign in to view and share stories.",
                icon: "info",
                confirmButtonColor: "#2563EB",
                confirmButtonText: "Oke",
                showCancelButton: false,
            }).then(() => {
                localStorage.setItem('welcomeShown', 'true');
            });
        }
    }

}

export { HomePresenter };
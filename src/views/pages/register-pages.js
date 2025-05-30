import { AuthConfig } from '../../config/auth-config.js';
import { RegisterPresenter } from '../../presenters/register-presenter.js';

class RegisterPage {
    constructor() {
        this._model = new AuthConfig();
        this._presenter = null;
    }

    async render() {
        console.log('Rendering register page');
        return `
      <section class="register-page page-transition">
        <div class="form-container">
          <h2 class="form-title">Register</h2>
          
          <div id="alert-container"></div>
          
          <form id="register-form">
            <div class="form-group">
              <label for="name" class="form-label">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-input" 
                required
                placeholder="Your name"
              >
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                required
                placeholder="your.email@example.com"
              >
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input" 
                required
                placeholder="Min. 8 characters"
                minlength="8"
              >
              <small>Password must be at least 8 characters</small>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                class="form-input" 
                required
                placeholder="Confirm your password"
                minlength="8"
              >
            </div>
            
            <button type="submit" class="btn btn-block">
                Register
            </button>
          </form>
          
          <div class="form-footer">
            <p>Sudah memiliki akun? <a href="#/login">Login here</a></p>
          </div>
        </div>
      </section>
    `;
    }

    async afterRender() {
        console.log('Register page afterRender');
        this._presenter = new RegisterPresenter(this._model, this);

        const registerForm = document.getElementById('register-form');
        if (!registerForm) {
            console.error('Register form not found in DOM');
            return;
        }

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            await this._presenter.register(name, email, password, confirmPassword);
        });
    }

    showLoading() {
        const submitButton = document.querySelector('#register-form button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            submitButton.disabled = true;
        }
    }

    hideLoading() {
        const submitButton = document.querySelector('#register-form button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Register';
            submitButton.disabled = false;
        }
    }

    showAlert(message, type = 'danger') {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = `
        <div class="alert alert-${type}">
          ${message}
        </div>
      `;

            alertContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    clearAlert() {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = '';
        }
    }
}

export { RegisterPage };
const routes = {
  '/login': { 
    templateId: 'login', 
    title: 'Login - Bank App',
    onShow: () => {}
  },
  '/dashboard': { 
    templateId: 'dashboard', 
    title: 'Dashboard - Bank App',
    onShow: () => { console.log('Dashboard is shown'); }
  },
  // Add other routes as needed
};

function updateRoute() {
  const path = window.location.pathname;
  const route = routes[path];

  if (!route) {
    return navigate('/login');
  }

  const template = document.getElementById(route.templateId);
  const view = template.content.cloneNode(true);
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(view);

  // Update the window title
  document.title = route.title;

  // Run the onShow function
  route.onShow();
}

function navigate(path) {
  window.history.pushState({}, path, path);
  updateRoute();
}

window.onpopstate = () => updateRoute();

// Update the route for the first time
updateRoute();

async function createAccount(account) {
  try {
    const response = await fetch('//localhost:5000/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: account
    });
    return await response.json();
  } catch (error) {
    return { error: error.message || 'Unknown error' };
  }
}

async function register() {
  const registerForm = document.getElementById('registerForm');
  const formData = new FormData(registerForm);
  const jsonData = JSON.stringify(Object.fromEntries(formData));
  const result = await createAccount(jsonData);

  if (result.error) {
    return console.log('An error occurred:', result.error);
  }

  console.log('Account created!', result);
}

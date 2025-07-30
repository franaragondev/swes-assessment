// Wait until the DOM content is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  // Select all navigation links that have a 'data-view' attribute
  const navLinks = document.querySelectorAll("a.nav-link[data-view]");
  // Select all sections with the class 'view' (these are the different views)
  const views = document.querySelectorAll("section.view");

  /**
   * Show the view with the given ID and hide all others.
   * Also update the active state of navigation links.
   *
   * @param {string} viewId - The ID of the view to show
   */
  function showView(viewId) {
    views.forEach((view) => {
      // Add 'd-none' class to hide views that do not match the viewId
      view.classList.toggle("d-none", view.id !== viewId);
    });
    navLinks.forEach((link) => {
      // Add 'active' class to the nav link corresponding to the current view
      link.classList.toggle(
        "active",
        link.getAttribute("data-view") === viewId
      );
    });
  }

  // Add click event listeners to all navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent the default link behavior (page jump)
      const viewId = link.getAttribute("data-view"); // Get the target view ID
      showView(viewId); // Show the selected view
    });
  });

  // On page load, display the default active view
  const activeLink = document.querySelector("a.nav-link.active");
  if (activeLink) {
    showView(activeLink.getAttribute("data-view"));
  } else if (views.length > 0) {
    // If no active link is found, show the first view by default
    showView(views[0].id);
  }
});

document.addEventListener('DOMContentLoaded', () => {
    asideBarEvent();
});


    const asideBarEvent = () => {

      const toggleBtn = document.getElementById("toggleSidebar");
      const sidebar = document.getElementById("sidebar");

        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("-translate-x-full");
        });
    };


    btnMobile.textContent = isOpen ? "☰" : "✕";
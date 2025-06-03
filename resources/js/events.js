document.addEventListener('DOMContentLoaded', () => {
    asideBarEvent();
});

const asideBarEvent = () => {
    const toggleBtn = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");

    toggleBtn.addEventListener("click", () => {
        const isOpen = sidebar.classList.contains("w-full");

        sidebar.classList.toggle("-translate-x-full");
        sidebar.classList.toggle("w-full");

        toggleBtn.textContent = isOpen ? "☰" : "✕";
    });
};


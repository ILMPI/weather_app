/* 
const tabsNavAll = document.querySelectorAll("[data-tab]");
const tabsContentAll = document.querySelectorAll("[data-tab-content]");

tabsNavAll.forEach(function (item) {
	item.addEventListener("click", function (event) {
		if (item.classList.contains("active")) return;

		tabsNavAll.forEach((i) => {
			i.classList.remove("active");
		});

		item.classList.add("active");

		tabsContentAll.forEach((i) => {
			i.classList.remove("active");
		});

		document.querySelector("#" + event.target.dataset.tab).classList.add("active");
	});
});
*/

function tabs(tabsBlockSelector) {
	const tabsNavAll = document.querySelectorAll(`${tabsBlockSelector} [data-tab]`);
	const tabsContentAll = document.querySelectorAll(`${tabsBlockSelector} [data-tab-content]`);

	tabsNavAll.forEach(tabNav => {
		tabNav.addEventListener('click', event => {
			// Check if the tab is already active
			if (tabNav.classList.contains('active')) return;
			// Remove the active class from all tabs and content

			tabsNavAll.forEach(nav => nav.classList.remove('active'));
			tabsContentAll.forEach(content => content.classList.remove('active'));

			// Add the active class to the current tab
			tabNav.classList.add('active');

			// Find the corresponding content
			const targetContentId = event.currentTarget.dataset.tab;
			const targetContent = document.querySelector(`#${targetContentId}`);

			// Check if the content exists
			if (targetContent) {
				targetContent.classList.add('active');
			} else {
				console.error(`Content with id="${targetContentId}" not found!`);
			}
		});
	});
}

tabs('.tabsBlock1');
tabs('.tabsBlock2');

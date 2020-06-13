if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
};

window.addEventListener("load", () => {
    let taskListElement = document.querySelector("main");
    let editorEntryElement = document.querySelector("*[data-name=editor-entry]");
    let storeElement = document.querySelector("*[data-name=store]");

    function onTaskElementClicked(event) {
        let tasksTextLines = getTasksText().split("\n");
        let taskElement = event.target;
        let taskLineIndex = parseInt(taskElement.getAttribute("data-line"));
        let taskText = tasksTextLines[taskLineIndex];
        if (taskText.charAt(0) === "x" && (taskText.length === 1 || taskText.charAt(1).trim().length === 0 )) {
            taskText = taskText.substr(2);
            taskElement.classList.remove("done");
        } else {
            taskText = "x " + taskText;
            taskElement.classList.add("done");
        }
        tasksTextLines[taskLineIndex] = taskText;
        updateTasksText(tasksTextLines.join("\n"));
        history.pushState("", "", "#" + encodeURI(getTasksText()));
    }

    function updateTasksText(tasksText) {
        storeElement.textContent = tasksText;
        let tasksTextLines = getTasksText().split("\n");
        let recycleElementIndex = 0;
        for (let taskLineIndex = 0; taskLineIndex < tasksTextLines.length; taskLineIndex++) {
            let taskText = tasksTextLines[taskLineIndex];
            let taskDone = false;
            if (taskText.charAt(0) === "x" && (taskText.length === 1 || taskText.charAt(1).trim().length === 0 )) {
                taskText = taskText.substring(2);
                taskDone = true;
            }
            taskText = taskText.trim();
            if (taskText.length === 0) {
                continue;
            }
            let taskElement;
            if (recycleElementIndex < taskListElement.childNodes.length) {
                taskElement = taskListElement.childNodes[recycleElementIndex];
            } else {
                taskElement = document.createElement("p");
                taskElement.addEventListener("click", onTaskElementClicked);
                taskListElement.append(taskElement);
            }
            recycleElementIndex += 1;
            taskElement.setAttribute("data-line", taskLineIndex);
            taskElement.classList.toggle("done", taskDone);
            taskElement.textContent = taskText;
        }
        for (let i = taskListElement.childNodes.length - 1;  i >= recycleElementIndex; i--) {
            taskListElement.removeChild(taskListElement.childNodes[i]);
        }
    }

    function getTasksText() {
        return storeElement.textContent;
    }

    function showEditor() {
        document.documentElement.classList.add("mode-edit");
        editorEntryElement.value = getTasksText();
        editorEntryElement.focus();
    }

    function hideEditor() {
        document.documentElement.classList.remove("mode-edit");
        document.documentElement.focus();
    }

    document.querySelector("*[data-name=editor-open]").addEventListener("click", () => {
        history.pushState("edit", "", "#" + encodeURI(getTasksText()));
        showEditor();
    });

    document.querySelector("*[data-name=editor-close]").addEventListener("click", () => {
        updateTasksText(editorEntryElement.value);
        history.replaceState("edit", "", "#" + encodeURI(getTasksText()));
        history.pushState("", "", "#" + encodeURI(getTasksText()));
        hideEditor();
    });

    window.onpopstate = () => {
        updateTasksText(decodeURI(location.hash.substring(1)));
        if (history.state === "edit") {
            showEditor();
        } else {
            hideEditor();
        }
    }

    editorEntryElement.value = "";
    hideEditor();

    if (history.state === null && location.hash.length === 0) {
        history.replaceState("", "", "#" + encodeURI(storeElement.textContent));
    }
    window.onpopstate();
});

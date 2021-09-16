
function startClock() {
	setInterval(showTime, 1000 * 60);

	function showTime() {
	    let time = new Date();
	    let hour = time.getHours();
	    let min = time.getMinutes();
	    let sec = time.getSeconds();
	    am_pm = "AM";
	  
	    if (hour > 12) {
	        hour -= 12;
	        am_pm = "PM";
	    }
	    if (hour == 0) {
	        hr = 12;
	        am_pm = "AM";
	    }
	  
	    hour = hour < 10 ? "0" + hour : hour;
	    min = min < 10 ? "0" + min : min;
	    sec = sec < 10 ? "0" + sec : sec;
	  
	    let currentTime = hour + ":" 
	            + min + am_pm;
	  
	    document.getElementById("clock")
	            .innerHTML = currentTime;
	}


	showTime();	
}


async function setBackground(force=false) {
	const imagekey = "todaysimage"
	const imageDateKey = "todaysimagedate"
	const url = "https://source.unsplash.com/1600x900/?nature";

	function setBackgroundImage(url) {
		document.getElementsByClassName("mainDiv")[0].style.backgroundImage = `url(${url})`
	}

	function setTodaysImage(url) {
		function setItem() {
				 console.log("Image Reload Done");
		}

		function onError(error) {
				 console.log(error)
		}


		browser.storage.local.set({
			[imagekey]: url
		}).then(setItem, onError);

		browser.storage.local.set({
			[imageDateKey]: new Date().getDate()
		})

	}

	function getNewImage() {
		fetch(url)
			.then(function(r) {
				setTodaysImage(r['url']);
				setBackgroundImage(r['url']);
			})

	}

    let time = new Date();
    let date = time.getDate();

    let storage = await browser.storage.local.get(imageDateKey);

    if(date == storage[imageDateKey] && !force) {
		let storage = await browser.storage.local.get(imagekey);

		if(storage[imagekey]) {
			setBackgroundImage(storage[imagekey]);
			return;
		}
    } 

    getNewImage();
}

function addReloadEvent() {
	this._reloadListener = () => setBackground(true);
	document.getElementById("reloadimage").removeEventListener("click", this._reloadListener);
	document.getElementById("reloadimage").addEventListener("click", this._reloadListener);
}

async function addToDo() {
	const todoKey = "todolist"

	showTodos();
	setEventListeners();

	function setEventListeners() {
		document.addEventListener('click', (el) => {
			function hasClass(elem, className) {
				return elem.classList.contains(className);
			}

			if(el && el.target && hasClass(el.target, 'taskRemoveBtn')) {
				let index = parseInt(el.target.value);
				removeTodo(index);
			}
		})

		this._addNewTodoListener = () =>  addNewTodo()
		document.getElementById("addNewButton").removeEventListener("click", this._addNewTodoListener);
		document.getElementById("addNewButton").addEventListener("click", this._addNewTodoListener);

		document.getElementById("addNewTodo").addEventListener('keydown', (e) => {
			if(e.keyCode == 13) {
				addNewTodo();
			}
		})
	}

	function getTasksStorage() {
		return browser.storage.local.get(todoKey);
	}

	function setTasks(tasklist) {
		return browser.storage.local.set({[todoKey]:tasklist});
	}

	async function removeTodo(index) {
		let storage = await getTasksStorage()
		let tasks = storage[todoKey]

		if(!tasks || !tasks.length) return
		
		tasks.splice(index, 1);
		setTasks(tasks);
		showTodos();
	}

	async function showTodos() {
		document.getElementById("taskList").innerHTML = "";
		let storage = await getTasksStorage()
		let tasks = storage[todoKey]

		if(!tasks || !tasks.length) return

		for(let i=0;i < tasks.length; i++) {
			document.getElementById("taskList").insertAdjacentHTML('beforeend',` <label>
			    <h3>${tasks[i]}
			    </h3>   
				<input class="label-check" type='checkbox'/>
				<button class="taskRemoveBtn" value=${i}> x </button>
			  </label>`)
		}

	}

	async function addNewTodo() {
		let storage = await getTasksStorage();
		let todolist;

		if(!storage[todoKey]) {
			todolist = [];
		} else {
			todolist = storage[todoKey];
		}

		todolist.push(document.getElementById("addNewTodo").value);
		document.getElementById("addNewTodo").value = "";
		await setTasks(todolist);
		showTodos()
	}

}


function main() {
	startClock();
	setBackground();
	addReloadEvent();
	addToDo();
}

main();
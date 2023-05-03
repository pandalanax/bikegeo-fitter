//  This file is part of BikeGeo.
//
//    BikeGeo is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License version 3 
//    as published by the Free Software Foundation.
//
//    BikeGeo is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with BikeGeo.  If not, see <http://www.gnu.org/licenses/>.
//
//  Copyright 2014 Juha Virtakoivu

//	Valentin Chirikov - bike addition, removal, save & load to file

function BikeData() {
	this.name = "Default";
	this.color = "#ff0000";
	this.hta = 71;
	this.fstack = 632;
	this.freach = 397;
	this.spacers = 35;
	this.headset = 15;
	this.sl = 90;
	this.sa = -9;
	this.handlebarReach = 75;
}

function BikeGeometryCalculations() {
	/* Geometry calculations */

	this.reach = function () {
		return this.freach;
	}
	this.reachWithSpacers = function () {
		return this.reach() - (this.spacers+this.headset) * Math.cos(deg2rad(this.hta));
	}
	this.reachWithStem = function () {
		// convert stem angle to XY space
		const stemAngleAct = deg2rad(90 - this.hta + this.sa);
		return this.reachWithSpacers() + this.sl * Math.cos(stemAngleAct);
	}
	this.reachWithStemWithHandlebar = function () {
		return this.reachWithStem() + this.handlebarReach;
	}

	this.stack = function () {
		return this.fstack;
	}
	this.stackWithSpacers = function () {
		return this.stack() + (this.spacers+this.headset) * Math.sin(deg2rad(this.hta));
	}
	this.stackWithStem = function () {
		// convert stem angle to XY space
		const stemAngleAct = deg2rad(90 - this.hta + this.sa);
		return this.stackWithSpacers() - this.sl * Math.sin(-stemAngleAct);
	}
}

function BikeGraphics() {
	this.drawBike = function () {
		// hack to reset canvas
		this.context.canvas.width += 0;
		
		const ttY = BB[1] - this.stack() * mm2px; // Y coordinate of top tube
		const seatX = BB[0] - this.reach() * mm2px; // X of top of seat tube
		//const axleY = BB[1] - this.bbDrop * mm2px; // Y coordinate of axles
		//const rearAxle = this.rearAxle() * mm2px + BB[0]; // X of rear axle
		//const frontAxle = this.frontAxle() * mm2px + BB[0]; // X of front axle

		// upper end of fork
		//const forkTX = BB[0] + (this.reach() + this.htl * Math.cos(deg2rad(this.hta))) * mm2px;
		//const forkTY = ttY + this.htl * Math.sin(deg2rad(this.hta)) * mm2px;

		// Drawing starts.
		// front triangle
		this.context.moveTo(BB[0], BB[1]); // start from bottom bracket
		this.context.lineTo(BB[0], ttY);
		this.context.lineTo(BB[0]+this.reach() * mm2px, ttY);
		this.context.lineTo(BB[0] + this.reachWithSpacers() * mm2px, BB[1] - this.stackWithSpacers() * mm2px);
		this.context.lineTo(BB[0] + this.reachWithStem() * mm2px, BB[1] - this.stackWithStem() * mm2px);
		this.context.lineTo(BB[0] + this.reachWithStemWithHandlebar() * mm2px, BB[1] - this.stackWithStem() * mm2px);

		// seat tube
		//this.context.lineTo(BB[0] + this.reach() * mm2px, ttY); // top tube
		//this.context.lineTo(forkTX, forkTY) // head tube
		//this.context.lineTo(BB[0], BB[1]); // down tube
		// rear triangle
		//this.context.lineTo(rearAxle, axleY); // chainstay
		//this.context.lineTo(seatX, ttY); // seat tube

		// fork
		//this.context.moveTo(forkTX, forkTY);
		//this.context.lineTo(frontAxle, axleY);

		/* stem and spacers
		this.context.moveTo(BB[0] + this.reach() * mm2px, ttY); // top tube
		this.context.lineTo(BB[0] + this.reachWithSpacers() * mm2px, BB[1] - this.stackWithSpacers() * mm2px);
		this.context.lineTo(BB[0] + this.reachWithStem() * mm2px, BB[1] - this.stackWithStem() * mm2px);
		*/
		this.context.strokeStyle = this.color;
		this.context.lineWidth = 2;
		this.context.stroke();
		
	}
}

Bike.prototype = new BikeData();

const uid = () =>
  String(
    Date.now().toString(32) +
      Math.random().toString(16)
  ).replace(/\./g, '')


// class handling stack and reach calculations and drawing of bikes
function Bike(id, cvs, form) {

	if(id) { 
		this.id = id; 
	} else {
		this.id = uid();
	}
	
	this.context = cvs.getContext("2d");

	// extend from bike data, calulations, graphics
	BikeData.call(this);
	BikeGeometryCalculations.call(this);
	BikeGraphics.call(this);

	this.data = Object.getPrototypeOf(this);

	// update the form
	this.updateFormReach = function () {
		// update outputs to form
		form.freach.value = this.reach().toFixed(numOfDec);
		form.reachWspc.value = (this.reachWithSpacers()).toFixed(numOfDec);
		form.reachWstm.value = (this.reachWithStem()).toFixed(numOfDec);
		form.reachWstmWhandlebar.value = (this.reachWithStemWithHandlebar()).toFixed(numOfDec);

	}

	// update the form
	this.updateFormStack = function () {
		// update outputs to form
		form.fstack.value = this.stack().toFixed(numOfDec);
		form.stackWspc.value = (this.stackWithSpacers()).toFixed(numOfDec);
		form.stackWstm.value = (this.stackWithStem()).toFixed(numOfDec);
	}


	// update callback for data
	this.update = function () {
		// update values from form
		this.name = form.name.value;
		this.hta = Number(form.hta.value);
		this.fstack = Number(form.fstack.value);
		this.freach = Number(form.freach.value);
		this.spacers = Number(form.spacers.value);
		this.headset = Number(form.headset.value);
		this.sl = Number(form.sl.value);
		this.sa = Number(form.sa.value);
		this.handlebarReach = Number(form.handlebarReach.value);

		this.color = form.color.value;

		// calculate stack and reach. Reach calculation uses stack value.
		this.updateFormReach(form);
		this.updateFormStack(form);

		// clear canvas and redraw the bike
		this.drawBike();
		// save bike data to local storage
		this.saveBike();
	}

	// function to save data to local storage
	this.saveBike = function () {
		const entries = Object.entries(this).filter( ([key, _value]) => { return key in this.data });
		localStorage.setItem(this.id, JSON.stringify(Object.fromEntries(entries)));
	}	

	this.saveBikeToFile = function () {
		this.saveBike();
		const a = document.createElement("a");
		const file = new Blob([localStorage.getItem(this.id)], {type: "application/json"});
		a.href = URL.createObjectURL(file);
		a.download = "bike_" + this.name;
		a.click();
	}
	
	// function to load saved data from local storage
	this.loadSavedData = function () {
		// if something isn't stored, bike data defaults are used
		if(localStorage.getItem(this.id)) {
			const data = JSON.parse(localStorage.getItem(this.id));
			for (const prop in data) { this[prop] = data[prop]; }
		}
	}	

	// function to load saved file data
	this.loadBikeFromFile = function () {
		const files = form.loadHidden.files;
		if(files.length > 0) {
			const file = files[0];
			file.text()
				.then((value) => { 
					localStorage.setItem(this.id, value); 
					this.loadSavedData(); 
					this.updateForm();})
				.catch((err) => { 
					console.log(err); 
					alert("Error loading bike data, check web console log for details !"); });			
		}
	}

	// function for update form data from model
	this.updateForm = function() {
		Object.getOwnPropertyNames(this.data).forEach(
			(propertyName) => { form[propertyName].value = this[propertyName]; }, this
		);		
	}

	this.remove = function() {
		const bikeIds = [];
		bikes.forEach((bike) => {if(bike !== this) bikeIds.push(bike.id)});
		localStorage.setItem("bikeIds", JSON.stringify(bikeIds));
		location.reload();
	}

	// load bike data from local storage
	this.loadSavedData();
}

// add new bike
function addBike(id, bikes) {
	const index = bikes.length;
	const newBikeForm = addForm(index);
	const newCanvas = addCanvas(index);

	// add column header
	addCell(row_bikes, "th", "input", "input",
		{name: "name", form: newBikeForm.id, type: "text", value : "Bike " + index, onChange : "bikes[" + index + "].update()"});
	addCell(row_hta, "td", "input", "input",
		{name: "hta", form: newBikeForm.id, type: "number", step : 0.1, min : -90, max : 90, onChange : "bikes[" + index + "].update()"});
	addCell(row_fstack, "td", "input", "input",
		{name: "fstack", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
		addCell(row_freach, "td", "input", "input",
		{name: "freach", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_spacers, "td", "input", "input",
		{name: "spacers", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_headset, "td", "input", "input",
		{name: "headset", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_sl, "td", "input", "input",
		{name: "sl", form: newBikeForm.id, type: "number", min : 0, max : 999, onChange : "bikes[" + index + "].update()"});
	addCell(row_sa, "td", "input", "input",
		{name: "sa", form: newBikeForm.id, type: "number", min : -90, max : 90, onChange : "bikes[" + index + "].update()"});
		addCell(row_handlebarReach, "td", "input", "input",
		{name: "handlebarReach", form: newBikeForm.id, type: "number", min : -90, max : 90, onChange : "bikes[" + index + "].update()"});
	//addCell(row_freach, "td", "output", "output", {name: "freach", form: newBikeForm.id});
	//addCell(row_fstack, "td", "output", "output", {name: "fstack", form: newBikeForm.id});
	addCell(row_reachWspc, "td", "output", "output", {name: "reachWspc", form: newBikeForm.id});
	addCell(row_stackWspc, "td", "output", "output", {name: "stackWspc", form: newBikeForm.id});
	addCell(row_reachWstm, "td", "output", "output", {name: "reachWstm", form: newBikeForm.id});
	addCell(row_stackWstm, "td", "output", "output", {name: "stackWstm", form: newBikeForm.id});
	addCell(row_reachWstmWhandlebar, "td", "output", "output", {name: "reachWstmWhandlebar", form: newBikeForm.id});

	addCell(row_color, "td", "input", "input",
		{name: "color", form: newBikeForm.id, type: "color", onChange : "bikes[" + index + "].update()"});

	const controlsCell = document.createElement("td");
	
	const saveButton = document.createElement("input");
	saveButton.setAttribute('name', "save");
	saveButton.setAttribute('value', "Save");
	saveButton.setAttribute('type', "button");
	saveButton.setAttribute('form', newBikeForm.id);
	saveButton.setAttribute('onclick', "bikes[" + index + "].saveBikeToFile()");

	const loadHiddenButton = document.createElement("input");
	loadHiddenButton.setAttribute('name', "loadHidden");
	loadHiddenButton.setAttribute('type', "file");
	loadHiddenButton.setAttribute('form', newBikeForm.id);
	loadHiddenButton.setAttribute('style', "display: none;");
	loadHiddenButton.setAttribute('accept', "application/json");
	loadHiddenButton.setAttribute('onchange', "bikes[" + index + "].loadBikeFromFile()");

	const loadButton = document.createElement("input");
	loadButton.setAttribute('name', "load");
	loadButton.setAttribute('type', "button");
	loadButton.setAttribute('value', "Load");
	loadButton.setAttribute('form', newBikeForm.id);
	loadButton.setAttribute('onclick', `${newBikeForm.id}.loadHidden.click()`);

	const removeButton = document.createElement("input");
	removeButton.setAttribute('name', "remove");
	removeButton.setAttribute('type', "button");
	removeButton.setAttribute('value', "Del");
	removeButton.setAttribute('form', newBikeForm.id);
	removeButton.setAttribute('onclick', "bikes[" + index + "].remove()");

	row_controls.appendChild(controlsCell);
	controlsCell.appendChild(saveButton);		
	controlsCell.appendChild(loadHiddenButton);		
	controlsCell.appendChild(loadButton);		
	controlsCell.appendChild(removeButton);		

	const newBike = new Bike(id, newCanvas, newBikeForm);
	newBike.updateForm();	
	newBike.update();
	bikes.push(newBike);

	const bikeIds = [];
	bikes.forEach((bike) => {bikeIds.push(bike.id)});
	localStorage.setItem("bikeIds", JSON.stringify(bikeIds));
}

// add new virtual bike form
function addForm(index) {
	const newBikeForm = document.createElement("form");
	newBikeForm.id = "bikeForm" + index;

	bikeForms.appendChild(newBikeForm);

	return newBikeForm;
}

// add new canvas
function addCanvas(index) {
	const canvases = document.getElementById("canvases");
	const newCanvas = document.createElement("canvas");
	newCanvas.id = "bike" + index;
	newCanvas.width = 600;
	newCanvas.height = 320;
	newCanvas.className = "bike";
	newCanvas.style = "z-index: " + (index + 1) + ";";

	canvases.appendChild(newCanvas);

	return newCanvas;
}

// add new table cell
function addCell(row, cellTag, cellClass, elementTag, elementOptions) {
	const newCell = document.createElement(cellTag);
	newCell.className = cellClass;

	const newElement = document.createElement(elementTag);

	if(elementOptions) {
		Object.entries(elementOptions).forEach(([key, value]) => { newElement.setAttribute(key, value); });
	}

	row.appendChild(newCell);
	newCell.appendChild(newElement);
}


'use strict'

var utils = require('./utils');
var db = require('diskdb')


db.connect('fileList', ['files'])
var list = db.files.find()[0].files;

var updateDB = function(){
  db.files.update({title: 'filesList'}, {files: list}, {multi: false, upsert: false})
}

var listHtml = function(fileObject, index){
  utils.compare(fileObject.hash, fileObject.filePath, (isSame) => {

    var name = fileObject.filePath.split('/')
    name = name[1] + '/.../' + name[name.length-1]
    var color = isSame ? 'same' : 'notSame';
    var html = '<li id='+index+' class="row">' + '<div class="'+color+'"></div>'+ '<div class="name">' + name + '</div>' + '<button class="button">remove</button>' + '</li>';
    $('#fileList').append(html)
  })
}

// var timer = setInterval(() => {
//   for(var i = 0; i<list.length; i++){
//     var fileObject = list[i];
//     utils.compare(fileObject.hash, fileObject.filePath, (isSame) => {
//       if(!isSame){
//         makeFileList()
//       }
//     })
//   }
// }, 1000)

var makeFileList = function(){
  $("#fileList").html('')
  for(var i = 0; i<list.length; i++){
    var fileObject = list[i];
    listHtml(fileObject, i);
  }
}

var updateList = function(name, index){
  var listItem = listHtml(name, index);
  $('#fileList').append(listItem);
}

function addButtonListener(){
  var buttons = document.querySelectorAll('button');
  for(var i=0; i<buttons.length; i++){
    buttons[i].addEventListener('click', removeHandler.bind(event))
  }
}

function removeButtonListener() {
  var buttons = document.querySelectorAll('button');
  for(var i=0; i<buttons.length; i++){
    buttons[i].removeEventListener('click', removeHandler)
  }
}

function removeHandler(e){
  var target = $(e.target).parent();

  removeDBElement(target.attr('id'));
  target.remove();
}

function bindSelectFileClick() {
  let button = document.querySelector('#select_file')
  button.addEventListener('click', function() {
    openFileDialog();
  })
}

function bindResetFileHash() {
  let button = document.querySelector('#reset_button');
  button.addEventListener('click', () => {
    alert('button clicked')
    list.forEach((file, index) => {
      updateHash(file, index)
    })
    setTimeout(makeFileList, 50)
  })
}

var updateHash = function(file, index){
  utils.hash(file.filePath, (data) => {
    list[index].hash = data;
    updateDB()
  })
}
var inputField = document.querySelector('#fileSelector');
function bindInputField(){
  var handler = function() {
    var filePath = this.value;
    utils.hash(filePath, (data) => {
      list.push({hash: data, filePath: filePath})
      updateDB()
      updateList({hash: data, filePath: filePath}, list.length-1);
      removeButtonListener();
      addButtonListener()
    })
  }
  inputField.addEventListener('change', handler, false)
}

function openFileDialog() {
  inputField.click();
}

var removeDBElement = function(index){
  var L = list.slice();
  var first = L.slice(0, index);
  var last = L.slice(index+1);
  list = first.concat(last);
  alert('updating db'+ list.length + index)
  updateDB(list)
}

window.onload = function(){
  bindSelectFileClick();
  bindResetFileHash();
  bindInputField();
  makeFileList();
  setTimeout(addButtonListener, 50);
}

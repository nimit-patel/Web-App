var uploadButton = document.getElementById("upload_btn");
var browseButton = document.getElementById("browse_btn")
var form = document.getElementById("upload_form");
var formUploadButton = document.getElementById("form_upload_btn");
var previewBoxes = document.getElementById("preview_boxes");
var imgSelectionView = document.getElementById("img_selection_view");
var imgView = document.getElementById("img_view");
var closeButton = document.getElementById("close_button");
var imgFiles = null;


uploadButton.addEventListener("click", function() {
    // trigger click event on browse button
    browseButton.click();
}, false);

// userCapture is set to true for capturing model of event propogation
browseButton.addEventListener("change", function(){
    // build the confirmation view with preview boxes based on selected files
    imgFiles = this.files;
    createPreviewBox();
    // shows the confirmation_view
    showConfirmationBox(false);
}, false);


previewBoxes.addEventListener("click", function(event){
    // stores all remove button elements
    let removeButtons = document.getElementsByClassName("remove_btn");
    // find and remove the preview box if event target id matches with button's
    for(let index = 0; index < removeButtons.length; ++index){
        if(removeButtons.item(index).id === event.target.id){
            // parent element of this remove button (a fieldset) will be removed
            removePreviewBox(removeButtons.item(index));
            break;
        }
    }
}, false);

form.addEventListener("submit", function(event){
      event.preventDefault();
      var formData = new FormData(form);
      var imgSelected = [];

      // for each description append the file that goes with it
      for(let [key, value] of formData.entries()){
            imgSelected.push(key);
      }

      for(let index = 0; index < imgSelected.length; ++index){
            formData.append(imgSelected[index], imgFiles[imgSelected[index]]);
      }
      post(formData);

}, false);

imgSelectionView.addEventListener("change", function(event){
      console.log(event.target.id);
      showImage(event.target.id);
}, false);


closeButton.addEventListener("click", function(){
      clearForm();
},false);

function post(formData){

  $.ajax( {
            url: "php/response.php",
            data: formData,
            processData: false,  // REQUIRED to successfully post formdata using jQuery
            contentType: false,
            type: "POST",
            dataType: "json",

            success: function ( json ) {
                  clearForm();                                  // clear the preview boxes on success confirmation
                  createImageSelectionView(json.success);       // creates a form with radio buttons
                //  showErrorMessages( json.failure );            // notify user with image files that didn't upload successfully
            },

            error: function ( xhr, status ) {
                  clearForm(); // clear preview boxes and prompt to retry
                  alert("Try again!");
            },

            complete: function( xhr, status ) {
                  //
            },

            cache: false
    } );
}


function createImageSelectionView(imgDescriptions){

    for(let info in imgDescriptions){
        let radio_btn = document.createElement("INPUT");
        let radio_btn_label = document.createElement("LABEL");

        // radio button
        radio_btn.setAttribute("type", "radio");
        radio_btn.setAttribute("name", "uselect"); // need to have same name attribute to group radio buttons
        radio_btn.classList.add("img_options");
        radio_btn.id = imgDescriptions[info].id;

        // label for radio radio button
        radio_btn_label.setAttribute("for", radio_btn.id);
        radio_btn_label.appendChild(document.createTextNode(imgDescriptions[info].description));

        // add this butto to the list
        imgSelectionView.appendChild(radio_btn);
        imgSelectionView.appendChild(radio_btn_label);
        imgSelectionView.appendChild(document.createElement('BR'));
    }
}


function showImage(id){
    $.ajax( {
            url: "php/response.php?id="+id,
            processData: false,  // REQUIRED to successfully post formdata using jQuery
            contentType: false,
            type: "GET",
            dataType: "json",

            success: function ( json ) {
                imgView.setAttribute("src",json.path);
            },

            error: function ( xhr, status ) {
            },

            complete: function( xhr, status ) {
            },

            cache: false
      } );
};

function clearForm(){
    showConfirmationBox(true);
    let removeButtons = document.getElementsByClassName("remove_btn");
     // JS updates the length once an element is removed resulting in different indexing
    for(let i = removeButtons.length - 1; i >= 0; --i){
        removePreviewBox(removeButtons.item(i));
    }
};

function showConfirmationBox(hide){
    document.getElementById("confirmation_view").style.visibility = (hide) ? "hidden" : "visible";
};

function createPreviewBox(){

    // for each file selected we need to create its seperate HTML markup
    for(let index = 0; index < imgFiles.length; ++index){

        var box = document.createElement("FIELDSET");
        var img = document.createElement("IMG");

        // making image viewable
        img.classList.add("preview_image");
        previewImage(imgFiles[index], img);

        // view right to the image
        var userInput = document.createElement("DIV");
        var descriptionLabel = document.createElement("LABEL");
        var description = document.createElement("TEXTAREA");
        var removeButton = document.createElement("INPUT");
        var labelName = document.createTextNode("Description");

        // make description field required
        description.type = "text";
        description.name = index;    // key will be index
        description.maxlength = 255;
        description.placeholder = "Your description of the image goes here...";
        description.required = false;

        // label for description
        descriptionLabel.for = index;
        descriptionLabel.appendChild(labelName);

        // make remove button
        removeButton.type = "button";
        removeButton.value = "Remove";
        removeButton.id = index;
        removeButton.classList.add("remove_btn");

        // CSS will style this preview_box
        box.classList.add("preview_box");

        // view left to the image
        userInput.classList.add("user_input");
        userInput.appendChild(descriptionLabel);
        userInput.appendChild(document.createElement('BR'));
        userInput.appendChild(description);

        // append content to the box
        box.appendChild(img);
        box.appendChild(userInput);
        box.appendChild(removeButton);

        previewBoxes.appendChild(box);
    }
};

function previewImage(imgFile, imgAttr){
    // read file data
    var reader = new FileReader();
    reader.readAsDataURL(imgFile);
    // set img src after the content of a file is read by an event
    reader.onload = function(e) { imgAttr.src = e.target.result; };
};

function removePreviewBox(element){
    // remove fieldset in which the remove button is placed
    element.parentElement.remove();
    // check if any preview box is left
    if(document.getElementsByClassName("preview_box").length === 0){
        showConfirmationBox(true); // set visibility to hidden when no preview box is left
    }
};

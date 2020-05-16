jQuery Right Click context menu plugin features: 

- Supports dynamic length of text inside menu items
- Supports nesting of multiple items
- Supports keyboard controls
- Supports IE 9 and above, as well as modern browsers


How to integrate this plugin: 

1. You can refer to index.html for an exemplary scenario. First, you will need to include the jQuery CDN in your own Html file,
preferably a minified version : <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>. Then you will need to include the css and js files to your html as standard (by using <link href="css-file-name-here.css" rel="stylesheet"> for the css and <script src="jquery-file-name-here.js"></script>
for the jQuery logic to be included. Names are exemplary, as you would probably need to rename files as per your own project's naming conventions
)
2. Optionally, you could load the  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.hoverintent/1.8.1/jquery.hoverIntent.min.js"></script> js hover intent plugin for smoother hover experience.

3. Add menu items, following the exemplary structure in index.html. The menu items can be nested and extended as needed.

4. Call this function on the element, where you want to display the right click menu:

<div class="target">This is the target element with class target, so the function can point to it and call the right click menu</div>

 $(document).ready(function () {
            $('.target').menu({
                menu: 'callbackMenu',
                on_select: function (e) {

refer to index.html for a thorough exemplary scenario. 

5. You are able to change the default behaviour inside the above function, by changing one of the following settings: 

e.g. hover_intent: ,
    mouse_button: left or right,
    keyboard: true or false, in case you need to allow keyboard support

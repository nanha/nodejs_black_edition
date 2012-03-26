exports.__doc__ = "NAME\n".yellow
    + "\tmustache\n"
    + "\n"
    + "MODULE DOCS\n".yellow
    + "\thttps://github.com/janl/mustache.js\n"
    + "\n"
    + "DESCRIPTION\n".yellow
    +"\tMustache.js - Logic-less {{mustache}} templates with JavaScript\n".red
    + "\n"
    +"\tUsage\n".red
    +"\t------\n"
    +"\tBelow is quick example how to use mustache.js:\n"
    +"\n"
    +"\tvar view = {\n".green
    +"\t  title: \"Joe\",\n".green
    +"\t  calc: function () {\n".green
    +"\t    return 2 + 4;\n".green
    +"\t  }\n".green
    +"\t};\n".green
    +"\n"
    +"\tvar output = Mustache.render(\"{{title}} spends {{calc}}\", view);\n".green
    +"\n"
    +"\tIn this example, the Mustache.render function takes two parameters: 1) the mustache template and 2) a view object that contains the data and code needed to render the template.\n"
    +"\n"
    +"\tCommonJS\n".cyan
    +"\t---------\n"
    +"\n"
    +"\tmustache.js is usable without any modification in both browsers and CommonJS environments like node.js. To use it as a CommonJS module, simply require the file, like this:\n"
    +"\n"
    +"\tvar Mustache = require(\"mustache\");\n".green
    +"\n"
    +"\n"
    +"\tTemplates\n".red
    +"\t---------\n"
    +"\n"
    +"\tA mustache template is a string that contains any number of mustache tags. Tags are indicated by the double mustaches that surround them. {{person}} is a tag, as is {{#person}}. In both examples we refer to person as the tag's key.\n"
    +"\n"
    +"\tThere are several types of tags available in mustache.js.\n"
    +"\n"
    +"\tVariables\n".cyan
    +"\t---------\n"
    +"\n"
    +"\tThe most basic tag type is a simple variable. A {{name}} tag renders the value of the name key in the current context. If there is no such key, nothing is rendered.\n"
    +"\n"
    +"\tAll variables are HTML-escaped by default. If you want to render unescaped HTML, use the triple mustache: {{{name}}}. You can also use & to unescape a variable.\n"
    +"\n"
    +"\tTemplate:\n".magenta
    +"\t---------\n"
    +"\n"
    +"\t* {{name}}\n".green
    +"\t* {{age}}\n".green
    +"\t* {{company}}\n".green
    +"\t* {{{company}}}\n".green
    +"\t* {{&company}}\n".green
    +"\n"
    +"\tView:\n".magenta
    +"\t------\n"
    +"\n"
    +"\t{\n".green
    +"\t  \"name\": \"Chris\",\n".green
    +"\t  \"company\": \"<b>GitHub</b>\"\n".green
    +"\t}\n".green
    +"\n"
    +"\tOutput:\n".magenta
    +"\t------\n"
    +"\n"
    +"\t* Chris\n".green
    +"\t*\n".green
    +"\t* &lt;b&gt;GitHub&lt;/b&gt;\n".green
    +"\t* <b>GitHub</b>\n".green
    +"\t* <b>GitHub</b>\n".green
    +"\n"
    +"\tJavaScript's dot notation may be used to access keys that are properties of objects in a view.\n"
    +"\n"
    +"\tTemplate:\n".magenta
    +"\t----------:\n"
    +"\n"
    +"\t* {{name.first}} {{name.last}}\n".green
    +"\t* {{age}}\n".green
    +"\n"
    +"\tView:\n".magenta
    +"\t------:\n"
    +"\n"
    +"\t{\n".green
    +"\t  \"name\": {\n".green
    +"\t    \"first\": \"Michael\",\n".green
    +"\t    \"last\": \"Jackson\"\n".green
    +"\t  },\n".green
    +"\t  \"age\": \"RIP\"\n".green
    +"\t}\n".green
    +"\n"
    +"\tOutput:\n".magenta
    +"\t------\n"
    +"\n"
    +"\t* Michael Jackson\n".green
    +"\t* RIP\n".green
    +"\n"
    +"\tSections\n".cyan
    +"\t---------\n"
    +"\n"
    +"\tSections render blocks of text one or more times, depending on the value of the key in the current context.\n"
    +"\n"
    +"\tA section begins with a pound and ends with a slash. That is, {{#person}} begins a person section, while {{/person}} ends it. The text between the two tags is referred to as that section's \"block\".\n"
    +"\n"
    +"\tThe behavior of the section is determined by the value of the key.\n"
    +"\n"
    +"\tFalse Values or Empty Lists\n"
    +"\n"
    +"\tIf the person key exists and has a value of null, undefined, or false, or is an empty list, the block will not be rendered.\n"
    +"\n"
    +"\tTemplate:\n".magenta
    +"\t---------\n"
    +"\n"
    +"\tShown.\n".green
    +"\t{{#nothin}}\n".green
    +"\tNever shown!\n".green
    +"\t{{/nothin}}\n".green
    +"\n"
    +"\tView:\n".magenta
    +"\t---------\n"
    +"\n"
    +"\t{\n".green
    +"\t  \"person\": true\n".green
    +"\t}\n".green
    +"\n"
    +"\tOutput:\n".magenta
    +"\t---------\n"
	+"\n"
    +"\tShown.\n".green
	+"\n"
    +"\tNon-Empty Lists\n".cyan
    +"\t----------------\n"
	+"\n"
    +"\tIf the person key exists and is not null, undefined, or false, and is not an empty list the block will be rendered one or more times.\n"
	+"\n"
    +"\tWhen the value is a list, the block is rendered once for each item in the list. The context of the block is set to the current item in the list for each iteration. In this way we can loop over collections.\n"
	+"\n"
    +"\tTemplate:\n".magenta
    +"\t----------\n"
	+"\n"
    +"\t{{#stooges}}\n".green
    +"\t<b>{{name}}</b>\n".green
    +"\t{{/stooges}}\n".green
	+"\n"
    +"\tView:\n".magenta
    +"\t----------\n"
	+"\n"
    +"\t{\n".green
    +"\t  \"stooges\": [\n".green
    +"\t    { \"name\": \"Moe\" },\n".green
    +"\t    { \"name\": \"Larry\" },\n".green
    +"\t    { \"name\": \"Curly\" }\n".green
    +"\t  ]\n".green
    +"\t}\n".green
	+"\n"
    +"\tOutput:\n".magenta
    +"\t----------\n"
	+"\n"
    +"\t<b>Moe</b>\n".green
    +"\t<b>Larry</b>\n".green
    +"\t<b>Curly</b>\n".green
	+"\n"
    +"\tWhen looping over an array of strings, a . can be used to refer to the current item in the list.\n"
	+"\n"
    +"\tTemplate:\n".magenta
    +"\t----------\n"
	+"\n"
    +"\t{{#musketeers}}\n".green
    +"\t* {{.}}\n".green
    +"\t{{/musketeers}}\n".green
	+"\n"
    +"\tView:\n".magenta
    +"\t--------\n"
	+"\n"
    +"\t{\n".green
    +"\t  \"musketeers\": [\"Athos\", \"Aramis\", \"Porthos\", \"D'Artagnan\"]\n".green
    +"\t}\n".green
	+"\n"
    +"\tOutput:\n".magenta
    +"\t----------\n"
	+"\n"
    +"\t* Athos\n".green
    +"\t* Aramis\n".green
    +"\t* Porthos\n".green
    +"\t* D'Artagnan\n".green
	+"\n"
    +"\tIf the value of a section variable is a function, it will be called in the context of the current item in the list on each iteration.\n"
	+"\n"
    +"\tTemplate:\n".magenta
    +"\t----------\n"
	+"\n"
    +"\t{{#beatles}}\n".green
    +"\t* {{name}}\n".green
    +"\t{{/beatles}}\n".green
	+"\n"
    +"\tView:\n".magenta
    +"\t------\n"
	+"\n"
    +"\t{\n".green
    +"\t  \"beatles\": [\n".green
    +"\t    { \"firstName\": \"John\", \"lastName\": \"Lennon\" },\n".green
    +"\t    { \"firstName\": \"Paul\", \"lastName\": \"McCartney\" },\n".green
    +"\t    { \"firstName\": \"George\", \"lastName\": \"Harrison\" },\n".green
    +"\t    { \"firstName\": \"Ringo\", \"lastName\": \"Starr\" }\n".green
    +"\t  ],\n".green
    +"\t  \"name\": function () {\n".green
    +"\t    return this.firstName + \" \" + this.lastName;\n".green
    +"\t  }\n".green
    +"\t}\n".green
	+"\n"
    +"\tOutput:\n".magenta
    +"\t------\n"
	+"\n"
    +"\t* John Lennon\n".green
    +"\t* Paul McCartney\n".green
    +"\t* George Harrison\n".green
    +"\t* Ringo Starr\n".green
	+"\n"
	+"\n"
    +"\tFunctions\n".cyan
    +"\t-----------\n"
	+"\n"
    +"\tIf the value of a section key is a function, it is called with the section's literal block of text, un-rendered, as its first argument. The second argument is a special rendering function that uses the current view as its view argument. It is called in the context of the current view object.\n"
	+"\n"
    +"\tTemplate:\n".magenta
    +"\t-----------\n"
	+"\n"
    +"\t{{#bold}}Hi {{name}}.{{/bold}}\n".green
	+"\n"
    +"\tView:\n".magenta
    +"\t-----------\n"
	+"\n"
    +"\t{\n".green
    +"\t  \"name\": \"Tater\",\n".green
    +"\t  \"bold\": function () {\n".green
    +"\t    return function (text, render) {\n".green
    +"\t      return \"<b>\" + render(text) + \"</b>\";\n".green
    +"\t    }\n".green
    +"\t  }\n".green
    +"\t}\n".green
	+"\n"
    +"\tOutput:\n".magenta
    +"\t-------\n"
    +"\t<b>Hi Tater.</b>\n".green
	+"\n"
	+"\n"
    +"\tInverted Sections\n".cyan
    +"\t-------------------\n"
	+"\n"
    +"\tAn inverted section opens with {{^section}} instead of {{#section}}. The block of an inverted section is rendered only if the value of that section's tag is null, undefined, false, or an empty list.\n"
	+"\n"
    +"\tTemplate:\n"
    +"\t-------\n"
    +"\t{{#repos}}<b>{{name}}</b>{{/repos}}\n".green
    +"\t{{^repos}}No repos :({{/repos}}\n".green
	+"\n"
    +"\tView:\n"
    +"\t-------\n"
	+"\n"
    +"\t{\n".green
    +"\t  \"repos\": []\n".green
    +"\t}\n".green
	+"\n"
    +"\tOutput:\n"
    +"\t-------\n"
    +"\tNo repos :(\n".green
	+"\n"
    +"\tComments\n".cyan
    +"\t----------\n"
	+"\n"
    +"\tComments begin with a bang and are ignored. The following template:\n"
	+"\n"
    +"\t<h1>Today{{! ignore me }}.</h1>\n".green
	+"\n"
    +"\tWill render as follows:\n"
	+"\n"
    +"\t<h1>Today.</h1>\n".green
	+"\n"
    +"\tComments may contain newlines.\n"
	+"\n"
	+"\n"
    +"\tPartials\n".cyan
    +"\t----------\n"
	+"\n"
    +"\tPartials begin with a greater than sign, like {{> box}}.\n"
	+"\n"
    +"\tPartials are rendered at runtime (as opposed to compile time), so recursive partials are possible. Just avoid infinite loops.\n"
	+"\n"
    +"\tThey also inherit the calling context. Whereas in ERB you may have this:\n"
	+"\n"
    +"\t<%= partial :next_more, :start => start, :size => size %>\n"
    +"\tMustache requires only this:\n"
	+"\n"
    +"\t{{> next_more}}\n".green
	+"\n"
    +"\tWhy? Because the next_more.mustache file will inherit the size and start variables from the calling context. In this way you may want to think of partials as includes, or template expansion, even though it's not literally true.\n"
	+"\n"
    +"\tFor example, this template and partial:\n"
	+"\n"
    +"\tbase.mustache:\n"
    +"\t<h2>Names</h2>\n".green
    +"\t{{#names}}\n".green
    +"\t  {{> user}}\n".green
    +"\t{{/names}}\n".green
	+"\n"
    +"\tuser.mustache:\n"
    +"\t<strong>{{name}}</strong>\n".green
	+"\n"
    +"\tCan be thought of as a single, expanded template:\n"
	+"\n"
    +"\t<h2>Names</h2>\n".green
    +"\t{{#names}}\n".green
    +"\t  <strong>{{name}}</strong>\n".green
    +"\t{{/names}}\n".green
    +"\n"
    +"\tIn mustache.js an object of partials may be passed as the third argument to Mustache.render. The object should be keyed by the name of the partial, and its value should be the partial text.\n"
    +"\n"
    +"\tSet Delimiter\n".cyan
    +"\t-------------\n"
	+"\n"
    +"\tSet Delimiter tags start with an equals sign and change the tag delimiters from {{ and }} to custom strings.\n"
	+"\n"
    +"\tConsider the following contrived example:\n"
	+"\n"
    +"\t* {{ default_tags }}\n".green
    +"\t{{=<% %>=}}\n".green
    +"\t* <% erb_style_tags %>\n".green
    +"\t<%={{ }}=%>\n".green
    +"\t* {{ default_tags_again }}\n".green
	+"\n"
    +"\tHere we have a list with three items. The first item uses the default tag style, the second uses ERB style as defined by the Set Delimiter tag, and the third returns to the default style after yet another Set Delimiter declaration.\n"
	+"\n"
    +"\tAccording to ctemplates, this \"is useful for languages like TeX, where double-braces may occur in the text and are awkward to use for markup.\"\n"
	+"\n"
    +"\tCustom delimiters may not contain whitespace or the equals sign.\n"
	+"\n"
	+"\n"
    +"\tStreaming\n".cyan
    +"\t----------\n"
    +"\tTo stream template results out of mustache.js, you can pass an optional callback to the call to Mustache.render:\n"
	+"\n"
    +"\tMustache.render(template, view, partials, function (chunk) {\n".green
    +"\t  print(chunk);\n".green
    +"\t});\n".green
	+"\n"
    +"\tWhen the template is finished rendering, the callback will be called with null after which it won't be called anymore for that rendering.\n"
    + "\n"
    ;

/**//* qdjui.js
 * Quick & Dirty User Interface
 *
 * @author Andrew Ortlieb <andyortlieb@gmail.com>
 * @website https://gist.github.com/andyortlieb/
 * @depends qdjscls
 * @license WTFPL v2:
 *
 * What's the point?
 * I'm bored. Don't judge me.
 *
 ********************************************************************
			DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
				   Version 2, December 2004

Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

		   DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

 0. You just DO WHAT THE FUCK YOU WANT TO.
 ********************************************************************
 *
 */

/* Library Definition.
 * You can also just copypasta the guts of this function if you'd rather.
 */
0;
(_qdjsload = function(namespace){
	"use strict";

	// A timer...
	namespace.governor = Class({
		init: function(conf){
			this.element = null;
			if (conf && conf.element){
				this.govern(conf.element);
			}
		},
		govern: function(el){
			if (this.element){ throw "Component already owns "+this.element; }
			if (el.governor){ throw "There's already a component controlling the element "+el; }
			this.element = el;
			el.governor = this;
		}
	});

	var patches = {
		element: function(){
			window.Element.prototype.govern = function(guvner){
				if (!guvner){
					console.log("Creating a generic ass governor")
					return (new namespace.governor({element:this}));
				}
				else if (guvner instanceof namespace.governor){
					console.log("Giving a governor a job!")
					guvner.govern(this);
					return guvner;
				}
				else {
					console.log("Creating a specified governor");
					var governor = new namespace.governor(guvner)
					governor.govern(this);
					return governor;
				}
			}
		}
	}

	namespace.patch = function(what){
		if (what != 'all'){
			return patches[what]();
		}

		// (It's all!);
		for (var what in patches){
			patches[what]();
		}

	}

});

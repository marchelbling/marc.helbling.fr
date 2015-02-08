var TocItem = function ( node, parent ) {
    this.node = node;
    this.parent = parent;
    this.tagName = ( this.node || { tagName: 'H0' } ).tagName
};

TocItem.prototype.add = function( node ) {
    item = new TocItem( node, this );
    this.container = ( this.container || [] );
    this.container.push( item );
    return item;
};

TocItem.prototype.toHtml = function( type ) {
    type = type || "li";

    // create a 'link' (i.e. <a href='link'>text</a>) node
    var a = document.createElement("a");
    a.appendChild( document.createTextNode( this.node.textContent ) );
    a.title = this.node.textContent;
    a.href = "#" + this.node.id;

    var node = document.createElement( type );
    node.appendChild( a );
    return node;
};

TocItem.prototype.htmlToc = function( htmlNode ) {
    var toc;
    if( typeof this.container != "undefined" &&  this.container.length > 0 ) {
        toc = document.createElement( "ol" );
        if ( typeof htmlNode != "undefined" ) {
            htmlNode.appendChild( toc );
        }
        for( var i = 0 ; i < this.container.length ; i ++ ) {
            var item = this.container[ i ];
            toc.appendChild( item.toHtml( "li" ) );
            item.htmlToc( toc );
        }
    }
    return toc;
};


function buildTagList( max_depth ) {
    var tags = 'h1';
    for (depth = 2 ; depth <= max_depth ; depth ++) {
        tags += ',h' + depth;
    }
    return tags;
};



function buildTocStructureForNode( node, max_depth ) {
    var children = node.querySelectorAll( buildTagList( max_depth ) );
    var root = new TocItem();

    var previous = root;
    for( i = 0 ; i < children.length ; i ++ ) {
        var child = children[i];
        if( child.tagName == previous.tagName ) {
            parent = previous.parent;
        }
        else if( child.tagName > previous.tagName ) {
            parent = previous;
        }
        else {
            parent = previous.parent;
            while( child.tagName <=  parent.tagName) {
                parent = parent.parent;
            }
        }
        previous = parent.add( child );
    }

    return root;
};


function buildArticleToc( from, depth ) {
    var article = document.getElementsByClassName( from )[0];
    return buildTocStructureForNode( article, depth );
};


function foldableToc( toc ) {
    var div = document.createElement("div");
    div.appendChild( document.createTextNode( "Content" ) );
    div.id = 'toc';
    div.className = 'nav-toc';
    div.appendChild( toc );

    // from http://www.justexample.com/wp/expand-and-collapse-html-list/
    var foldOnClick() = function() {
      if( this.parentNode ){
          var childList = this.parentNode.getElementsByTagName( 'UL' );
          for(var j = 0; j < childList.length ; j ++){
              var currentState = childList[ j ].style.display;
              if( currentState=="none" ){
                  childList[ j ].style.display = "block";
              }
              else{
                  childList[ j ].style.display = "none";
              }
            }
        }
    };
    makeOLFoldable( toc, foldOnClick );
    return div;
};

var left = document.querySelector("body header");
var deets = document.querySelector("body header div.deets")
var toc = buildArticleToc( "body", 2 ).htmlToc();
left.insertBefore( toc, deets );

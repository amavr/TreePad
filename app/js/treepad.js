function TreePad(selector) {

    var me = this;
    var $obj = $(selector);
    $obj.addClass("tree");
    $obj.bind('click', function (e) {
        //$(".tree li > span.selected").removeClass("selected");
        //e.stopPropagation();
    });

    var node_states = {
        collapsed: { title: "Expand", img_old: "minus", img_new: "plus" },
        expanded: { title: "Collapse", img_old: "plus", img_new: "minus" },
        empty: { title: "Empty", img_old: "file", img_new: "file" }
    }

    function unselect() {
        var $old = $(".tree li > span.selected");
        if ($old.length > 0) {
            $old.removeClass("selected");
        }
    }

    var clickLabel = function(e) {
        e.stopPropagation();

        me.select($(this).parent());
    }

    var clickIcon = function (e) {
        e.stopPropagation();

        // var $li = $(this).parent().parent();
        var $span = $(this.parentNode);
        var $li = $span.parent('li.parent_li');
        var $i = $(this);

        var $children = get_children($li);

        if ($children.length > 0) {
            var is_expanded = $children.is(":visible");
            var state = is_expanded ? node_states.collapsed : node_states.expanded;

            if (is_expanded) {
                $children.hide('fast');
            }
            else {
                $children.show('fast');
                update_children_icons($children);
            }

            $(this.parentNode)
                .attr('title', state.title)
                .find(' > i')
                .addClass('glyphicon-' + state.img_new)
                .removeClass('glyphicon-' + state.img_old);
        }
    }

    var update_children_icons = function ($children) {
        var n = $children.length;
        for (var i = 0; i < n; i++) {
            var $children2 = get_children($children[i]);
            if ($children2.length == 0) {
                var $i = $($children[i]).find('> span > i');
                $i.addClass('glyphicon-file');
                $i.removeClass('glyphicon-plus');
                $i.removeClass('glyphicon-minus');
            }
        }
    }

    var get_children = function ($li) {
        return $($li).find(' > ul > li');
    }

    var getNodeData = function (node) {
        var $node = $(node);
        var data = {
            title: $node.find('> span > div').text(),
            text: $node.data('text'),
            children: []
        }
        var nodes = $node.find('> ul > li');
        for (var i = 0; i < nodes.length; i++) {
            data.children.push(getNodeData(nodes[i]))
        }
        return data;
    }

    this.getData = function () {
        var list = [];
        var $root_ul = $('.tree > ul');


        var nodes = $root_ul.find(' > li');
        for (var i = 0; i < nodes.length; i++) {
            list.push(getNodeData(nodes[i]))
        }

        return list;
    }

    this.select = function ($node) {
        unselect();

        var text = $node.data("text");
        $("#text").val(text);
        $node.find('> span').addClass("selected");
    }

    this.show = function (nodes) {
        if (nodes.length > 0) {
            var $ul = $("ul", $obj.append("<ul></ul>"));
            for (var i = 0; i < nodes.length; i++) {
                new TreeNode($ul, nodes[i], true, clickLabel, clickIcon);
            }

            var first = $('li span', $ul).first();
            if (first.length > 0) {
                me.select(first.parent());
            }

            var $root_nodes = $('.tree > ul > li');
            update_children_icons($root_nodes);
        }
    }

    this.add = function (node_data) {

        var selected = me.getSelected();

        if (selected.length == 0){
            selected = $('.tree');
        }
        else {
            selected = selected.parent();
        }

        var $ul = $('> ul', selected);
        if ($ul.length == 0) {
            $ul = $('> ul', selected.append('<ul></ul>'));
        }

        new TreeNode($ul, node_data, true, clickLabel, clickIcon);

        me.select($ul.children().last());
    }

    this.delete = function () {
        var selected = me.getSelected();
        var $li = selected.parent();
        var new_li = $li.next();
        if (new_li.length == 0) {
            new_li = $li.prev();
            if (new_li.length == 0) {
                new_li = $li.parent().parent();

                new_li
                    .attr('title', node_states.expanded.title)
                    .find('span > i')
                    .addClass('glyphicon-file')
                    .removeClass('glyphicon-' + node_states.expanded.img_old)
                    .removeClass('glyphicon-' + node_states.expanded.img_new);
                }
        }
        $li.remove();
        if (new_li.length > 0) {
            me.select(new_li);
        }
    }

    this.up = function () {
        var $span = me.getSelected();
        if ($span.length == 0) return;
        var $li = $span.parent();
        $li.prev().before($li);
    }

    this.down = function () {
        var $span = me.getSelected();
        if ($span.length == 0) return;
        var $li = $span.parent();
        $li.next().after($li);
    }

    this.getSelected = function () {
        var selected = $(".tree li > span.selected");
        return selected;
    }

    this.hasChild = function ($node_span) {
        if ($node_span) {
            return $node_span.parent().find('ul').length > 0;
        }
        else {
            return false;
        }
    }
}



function TreeNode(parent, node_data, visible, onClickLabel, onClickIcon) {

    var me = this;
    var $me = null;
    var $parent = parent;

    this.title = node_data.title;
    this.text = node_data.text;

    var li_class = '';
    var i_class = 'file';

    if (node_data.children != undefined) {
        li_class = ' class="parent_li"';
        var i_class = 'plus';
    }

    var $li = $parent.parent();
    if (!$li.hasClass('parent_li')) {
        $li.addClass('parent_li');
    }

    var $i = $('> span > i', $li);
    if ($i.hasClass('glyphicon-file')) {
        $i.removeClass('glyphicon-file');
        $i.addClass('glyphicon-minus');
    }

    this.select = function () {

    }

    this.expand = function () {

    }

    this.collapse = function () {

    }

    this.up = function () {

    }

    this.down = function () {

    }

    var constructor = function () {

    }


    var html = '<li' + li_class + '><span><i class="glyphicon glyphicon-' + i_class + '"></i><div>' + me.title + '</div></span></li>';
    $me = $(html);
    $parent.append($me);
    if (!visible) {
        $me.hide();
    }

    $me.data("text", me.text);

    $("span", $me).bind("click", onClickLabel);
    $("span > i", $me).bind("click", onClickIcon);

    $("span > div", $me).bind('dblclick', function () {
        this.contentEditable = true;
    });

    $("span > div", $me).bind('blur', function () {
        this.contentEditable = false;
    });

    $("span > div", $me).keypress(function (e) {
        if (e.which == 13)
        {
            this.contentEditable = false;
            return false;
        }
    });

    $("span", $me).focusout(function () {
        $me.data = $("#text").val();
    });

    if (node_data.children != undefined && node_data.children.length > 0) {
        var $ul = $("<ul></ul>");
        $me.append($ul);
        for (var i = 0; i < node_data.children.length; i++) {
            new TreeNode($ul, node_data.children[i], false, onClickLabel, onClickIcon);
        }
    }
    else {

    }

    this.data = function () {
        return $me.data('text');
    }
}
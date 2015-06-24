function Tree(boxId, data) {

    var me = this;
    var $box = $(boxId);
    var $ul = null;

    var items = [];
    var selected = null;

    var append = function (article) {
        items.push(article)
    }

    var switchState = function (e) {
        console.log(e);
        var a = $(e).data('article');
        console.log(a);
    }

    var putText = function () {
        if (selected) selected.text = $("#text").val();
    }

    var getText = function () {
        var text = (selected) ? selected.text : '';
        $("#text").val(text);
    }

    var onSelect = function (node) {
        putText();
        selected = node;
        getText();
    }

    this.add = function (data) {
        var ul = (selected == null) ? $ul : selected.ul();
        var node = new Article(ul, data, true, onSelect);
        if (selected) selected.expand();
        node.select();
    }

    this.delete = function () {
        if(selected){
            var $li = selected.li();
            var $new_li = $li.next();
            if($new_li.length == 0){
                $new_li = $li.prev();
                if($new_li.length == 0){
                    $new_li = $li.parent().parent();
                    
                     $new_li
                         .find('span > i')
                         .addClass('glyphicon-file')
                         .removeClass('glyphicon-minus')
                         .removeClass('glyphicon-plus');
                 }
            }
            $li.remove();
            if($new_li.length > 0){
                selected = $new_li.data('article');
                $new_li.find('> span').addClass('selected');
                var data = $new_li.data('article');
                console.log(data);
            }
        } 
    }

    this.up = function () {
        if (selected) {
            var $li = selected.li();
            $li.prev().before($li);
        }
    }

    this.down = function () {
        if (selected) {
            var $li = selected.li();
            $li.next().after($li);
        }
    }

    this.getData = function(){
        var $list = $ul.find('> li');
        var count = $list.length;
        var data = [];
        for(var i = 0; i < count; i++){
            var art = $($list[i]).data('article');
            data.push(art.getData());
        }
        return data;
    } 

    var constructor = function () {
        $ul = $('<ul></ul>');
        $box.append($ul);

        $box.bind('click', function (e) {
            e.stopPropagation();
            $(".tree li > span.selected").removeClass("selected");
            onSelect();
        });

        $box.addClass("tree");

        //$box.delegate('i', 'click', function (e) {
        //    // switchState(e);
        //});

        if (data != undefined && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                append(new Article($ul, data[i], true, onSelect));
            }
        }
    }

    constructor();
}
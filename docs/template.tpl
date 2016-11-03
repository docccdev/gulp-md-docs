<!DOCTYPE html>
<html>
    <head>
        <title>Gulp md docs</title>
        <meta charset="utf-8">
        <link href="<%= path %>uikit.css" media="all" rel="stylesheet" type="text/css" />
        <link href="<%= path %>style.css" media="all" rel="stylesheet" type="text/css" />
        <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:400,700italic,700,500,500italic,400italic,300italic,300&amp;subset=latin,cyrillic'>
        <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.6.0/styles/github.min.css">
        <script src="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.6.0/highlight.min.js"></script>
        <script>hljs.initHighlightingOnLoad();</script>
    </head>
    <body>
        <div class="ui-grid ui-grid_size_xxxl">
            <div class="ui-grid__item ui-width-1-1">
                <div class="uidocs-header" id="uikit-header">
                    <div class="uidocs-page">
                        <a href="/uikit" class="uidocs-header__logo">uikit</a>
                        <% if (!_.isEmpty(headerMenu)) { %>
                            <div class="uidocs-header__menu">
                                <% _.forEach(headerMenu, function(data) { %>
                                    <a href="#" class="uidocs-header__menu-item">
                                        <%- data.text %>
                                    </a>
                                <% }) %>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
            <div class="ui-grid__item ui-width-1-1">
                <div class="uidocs-page">
                    <div class="ui-grid ui-grid_theme_divider ui-grid_size_xl">
                        <div class="ui-grid__item ui-width-1-4">
                            left menu
                        </div>
                        <div class="ui-grid__item ui-width-3-4">
                            <%= content %>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ui-grid__item ui-width-1-1 ui-grid ui-grid_align_center">
                <div class="ui-grid__item">© Bigl</div>
                <br>
                <br>
            </div>
        </div>
    </body>
</html>

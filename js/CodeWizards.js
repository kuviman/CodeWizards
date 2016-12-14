function error(reasonList) {
    QE.cancelFullscreen();
    var $codewizards = $(".codewizards-player");
    $codewizards.find(".loading-screen").hide();
    $codewizards.find(".game-screen").hide();
    var $failedScreen = $codewizards.find(".failed-screen");
    reasonList.forEach(function (reason) {
        $failedScreen.append($("<p></p>").html(reason));
    });
    $failedScreen.show();
}

var jQueryResource = new QE.Resource();
$(function () {
    var $codewizards = $(".codewizards-player");
    if (QE.initialized) {
        var $progressBar = $codewizards.find(".resource-loading-progress-bar");
        var $progress = $codewizards.find(".resource-loading-progress");
        QE.onResourceProgress = function (progress) {
            progress = progress * 100;
            $progressBar.width(progress + "%");
            $progress.text(Math.round(progress).toString());
        };

        var player = new Player();

        function reconnect() {
            var token = $(".codewizards-game-token").text();
            var url = "http://russianaicup.ru/boombox/data/games/" + token;
            player.connect(url);
        }

        reconnect();
        $(".codewizards-token-form").submit(function () {
            var $input = $(".codewizards-token-form input[name=gameToken]");
            if ($input.val().length != 0) {
                $(".codewizards-game-token").text($input.val());
                $input.val("");
                reconnect();
            }
            return false;
        });

        QE.onResourcesLoaded.push(function () {
            $codewizards.find(".loading-screen").hide();
            var $gameScreen = $codewizards.find(".game-screen");
            $gameScreen.prepend($(QE.canvas));
            $gameScreen.show();

            QE.run(function (deltaTime) {
                player.render(deltaTime);
            }, function () {
                player.updateHtml();
            });
        });
    } else {
        error(QE.failReason);
    }
    jQueryResource.confirmLoaded();
});
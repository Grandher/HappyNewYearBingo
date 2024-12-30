$(function () {
    // При загрузке страницы восстанавливаем порядок картинок и цвет заголовка
    const savedOrder = JSON.parse(localStorage.getItem("players"));
    const savedColor = localStorage.getItem("titleColor");
    const globalMatrix = JSON.parse(localStorage.getItem("globalMatrix")) || [];

    let counter = 0;
    if (savedOrder) {
        const photoWrapper = $(".photo_wrapper");
        savedOrder.forEach(player => {
            const img = $(`img[src='${player.src}']`).parent();
            if (player.status) {
                img.addClass("disabled");
                img.find(".stats span").text(player.answers);
                counter++;
            }
            photoWrapper.append(img);
        });
    }

    if (counter === savedOrder.length) {
        if (
            globalMatrix.reduce((sum, value) => sum + (value ? 1 : 0), 0) === globalMatrix.length
        ) {
            $("h1").text("Победа!!!");
            $(".fireworks").show();
        } else {
            $("h1").text("Ну вы чо блин");
        }
    }

    if (savedColor) {
        $("h1").css("color", savedColor);
    }

    // Функция для перемешивания массива
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    $("h1").click(async function () {
        // Генерация случайного яркого цвета
        let r, g, b;
        do {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
        } while (r + g + b < 384);

        const newColor = `rgb(${r}, ${g}, ${b})`;
        this.style.color = newColor;

        // Перемешивание картинок
        const photoWrapper = $(".photo_wrapper");
        const photos = $(".photo");
        const photoSources = photos.map(function () {
            return {
                id: $(this).find("img").attr("id"),
                src: $(this).find("img").attr("src"),
                status: false,
            };
        }).get();

        shuffle(photoSources);

        photoSources.forEach(photo => {
            const img = $(`img[src='${photo.src}']`).parent();
            photoWrapper.append(img);
        });

        // Загрузка вопросов
        const questions = await fetch("questions.json").then(res => res.json());

        // Выбор 49 случайных вопросов для первого игрока
        const selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 49);

        // Сохранение в localStorage
        localStorage.setItem("questions", JSON.stringify(selectedQuestions.map(q => q.id)));
        localStorage.setItem("globalMatrix", JSON.stringify(new Array(49).fill(false)));
        localStorage.setItem("players", JSON.stringify(photoSources));
        localStorage.setItem("titleColor", newColor);
    });

    $(".photo img").click(function () {
        if ($(this).parent().hasClass("disabled")) {
            return;
        }
        const playerId = $(this).attr("id");
        window.location.href = `/game.html?player=${playerId}`;
    });
});

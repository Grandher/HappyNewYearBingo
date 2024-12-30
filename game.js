$(function () {
    const playerId = new URLSearchParams(window.location.search).get("player");
    const questionIds = JSON.parse(localStorage.getItem("questions"));
    const globalMatrix = JSON.parse(localStorage.getItem("globalMatrix")) || [];
    const players = JSON.parse(localStorage.getItem("players")) || [];

    const currentPlayer = players.find(player => player.id === playerId);

    const currentPlayerQuestions = {
        marked: new Array(49).fill(false),
        passed: new Array(49).fill(false),
    };

    fetch("questions.json")
        .then(res => res.json())
        .then(questions => {
            const questionMap = Object.fromEntries(questions.map(q => [q.id, q.text]));
            const selectedQuestions = questionIds.map(id => ({ id, text: questionMap[id] }));

            const grid = $(".grid");
            grid.empty();

            // Отображаем текущие вопросы
            selectedQuestions.forEach((q, i) => {
                const answer = globalMatrix[i] ? "answer" : "";
                const marked = currentPlayerQuestions.marked[i] ? "marked" : "";
                const passed = currentPlayerQuestions.passed[i] ? "passed" : "";
                const text = Math.random() > 0.2 ? q.text : "В этом году " + q.text.toLowerCase();

                grid.append(`<div class="cell ${marked} ${passed} ${answer}" data-id="${i}">${text}</div>`);
            });

            $(".cell").click(function () {
                const id = $(this).data("id");

                const passedQuestions = currentPlayerQuestions.passed
                    .map((passed, i) => (passed ? selectedQuestions[i] : null))
                    .filter(q => q);

                // Логика выделения
                if (!currentPlayerQuestions.marked[id] && !currentPlayerQuestions.passed[id]) {
                    currentPlayerQuestions.marked[id] = true; // Выделяем
                    $(this).addClass("marked");
                } else if (currentPlayerQuestions.marked[id] && !currentPlayerQuestions.passed[id] && passedQuestions.length < 7 && !isLastPlayer(players)) {
                    currentPlayerQuestions.marked[id] = false;
                    currentPlayerQuestions.passed[id] = true; // Помечаем для передачи
                    $(this).removeClass("marked").addClass("passed");
                } else {
                    // Снимаем выделение
                    currentPlayerQuestions.marked[id] = false;
                    currentPlayerQuestions.passed[id] = false;
                    $(this).removeClass("marked passed");
                }
            });

            $("#ready").click(function () {
                // Проверяем количество выделенных для передачи
                const passedQuestions = currentPlayerQuestions.passed
                    .map((passed, i) => (passed ? selectedQuestions[i] : null))
                    .filter(q => q);

                if (passedQuestions.length !== 7 && !isLastPlayer(players)) {
                    alert("Не забудь отдать 7 вопросов следующему!");
                    return;
                }

                // Отмечаем вопросы как сыгранные
                selectedQuestions.forEach((q, i) => {
                    if (currentPlayerQuestions.marked[i]) {
                        globalMatrix[i] = true;
                    }
                });

                // Заменяем остальные вопросы на новые
                const usedQuestionIds = new Set(globalMatrix.map((v, i) => (v ? questionIds[i] : null)).filter(Boolean));
                const newQuestions = questions.filter(q => !usedQuestionIds.has(q.id));
                const shuffledNewQuestions = newQuestions.sort(() => Math.random() - 0.5);

                const nextQuestions = selectedQuestions.map((q, i) => {
                    if (currentPlayerQuestions.passed[i]) {
                        return q; // Сохраняем вопросы, отмеченные как passed
                    } else {
                        // Заменяем остальные на новые
                        return shuffledNewQuestions.pop();
                    }
                });

                if (nextQuestions.some(q => !q)) {
                    alert("Не хватает вопросов для следующего игрока. Проверьте файл questions.json.");
                    return;
                }

                // Сохраняем обновлённые данные
                localStorage.setItem("questions", JSON.stringify(nextQuestions.map(q => q.id)));
                localStorage.setItem("globalMatrix", JSON.stringify(globalMatrix));

                // Обновляем статус текущего игрока
                currentPlayer.status = true;
                currentPlayer.answers = currentPlayerQuestions.marked.reduce((sum, value) => sum + (value ? 1 : 0), 0);
                localStorage.setItem("players", JSON.stringify(players));

                window.location.href = "/index.html";
            });
        });

    function isLastPlayer(players) {
        return players.filter(player => player.status === false).length === 1;
    }
});

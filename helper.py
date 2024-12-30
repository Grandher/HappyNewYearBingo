import json

def assign_sequential_ids(input_file, output_file, start_id=1):
    try:
        # Чтение JSON-файла
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Проверка, что данные - список
        if not isinstance(data, list):
            print("Ошибка: JSON должен быть массивом объектов.")
            return
        
        # Присвоение последовательных ID
        for index, item in enumerate(data, start=start_id):
            if isinstance(item, dict):
                item['id'] = index
            else:
                print(f"Предупреждение: Элемент под индексом {index} не является объектом.")
        
        # Запись обновленного JSON в новый файл
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"Успешно присвоено ID от {start_id} до {index}. Обновленный файл сохранен как '{output_file}'.")
    
    except FileNotFoundError:
        print(f"Ошибка: Файл '{input_file}' не найден.")
    except json.JSONDecodeError as e:
        print(f"Ошибка при разборе JSON: {e}")

if __name__ == "__main__":
    input_filename = 'questions.json'   # Замените на имя вашего исходного файла
    output_filename = 'questions_with_ids.json'  # Имя файла с присвоенными ID
    
    assign_sequential_ids(input_filename, output_filename)
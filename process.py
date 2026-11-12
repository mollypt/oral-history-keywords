from pathlib import Path
import re

dir_path = Path("segments")


def main():
    for file_path in list(dir_path.iterdir()):
        if file_path.is_file():
            # Open and read the file
            print(file_path)
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
                content = content.replace("\n ", "")
                # content = content.replace("\t", "")
                content = content.replace("   ", " ")
                # content = content.replace("  ", " ")
                path_name = Path(file_path).name

                content = re.sub(r"\<.*?\>", "", content).strip()
                content = content.replace("  ", " ")
                content = content.replace(" ,", ",")
                content = content.replace(' "', '"')

                # Open the file in write mode with UTF-8 encoding
                with open(f"formatted/{path_name}", "w", encoding="utf-8") as file:
                    file.write(content)


if __name__ == "__main__":
    main()

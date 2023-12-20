**Tabler** converts delimited data into a nicely formatted markdown snippet. 
It also converts nicely formatted markdown snippets into their corresponding delimited data.

Tabler uses tests to specify its behavior. If you're not sure what it *should* do, the tests are a good place to start.

Given delimited data ...
```
Attribute	List	Set
Notation	[Square Brackets]	{Curly Brackets}
Order matters	Yes	No
Repetition allowed	Yes	No
```

... return a nicely formatted markdown snippet:
```
| Attribute              | List                  | Set                  |
|:-----------------------|:----------------------|:---------------------|
| Notation               | [Square Brackets]     | {Curly Brackets}     |
| Order matters          | Yes                   | No                   |
| Repetition allowed     | Yes                   | No                   |
```

Rendered:
| Attribute              | List                  | Set                  |
|:-----------------------|:----------------------|:---------------------|
| Notation               | [Square Brackets]     | {Curly Brackets}     |
| Order matters          | Yes                   | No                   |
| Repetition allowed     | Yes                   | No                   |


A column spec is optional as line 2 in the delimited data. If omitted, all columns left-aligned is default.

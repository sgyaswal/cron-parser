# Cron Expression Parser

A command-line application that parses cron strings and expands each field to show the times at which it will run.

## Features

- Parses standard cron format with five time fields (minute, hour, day of month, month, day of week) plus a command
- Supports:
  - Wildcards (`*`)
  - Ranges (`1-5`)
  - Lists (`1,15`)
  - Step values (`*/15`)
  - Combinations of the above

## Requirements

- Node.js (v14 or higher)

## Installation

No installation required. Simply clone or download the project.

```bash
cd cron-parser
```

## Usage

Run the parser with a cron string as an argument:

```bash
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

### Example

Input:
```bash
node cron-parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

Output:
```
minute        0 15 30 45
hour          0
day of month  1 15
month         1 2 3 4 5 6 7 8 9 10 11 12
day of week   1 2 3 4 5
command       /usr/bin/find
```

## Field Specifications

| Field        | Range      | Special Characters |
|--------------|------------|--------------------|
| Minute       | 0-59       | * , - /            |
| Hour         | 0-23       | * , - /            |
| Day of Month | 1-31       | * , - /            |
| Month        | 1-12       | * , - /            |
| Day of Week  | 0-6 (or 1-7) | * , - /          |

## Running Tests

```bash
npm test
```

## Implementation Details

The parser handles:
- **Asterisk (*)**: All possible values for the field
- **Comma (,)**: Multiple specific values (e.g., `1,15`)
- **Hyphen (-)**: Range of values (e.g., `1-5`)
- **Slash (/)**: Step values (e.g., `*/15` or `0-30/5`)

## Development

The project consists of:
- `cron-parser.js` - Main CLI application
- `parser.js` - Core parsing logic
- `parser.test.js` - Unit tests

## Limitations

- Does not support special time strings like `@yearly`, `@monthly`, etc.
- Day of week uses numeric values only (0-6 or 1-7)
- Does not validate whether day of month is valid for a specific month

## License

MIT

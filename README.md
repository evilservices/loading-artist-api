# Install
```
npm install grunt-cli -g
npm install
```

# Configure
Create file "config/default.json" with your database configuration

```
{
  "db": {
    "connectionLimit": 20,
    "host": "localhost",
    "database": "loadingartist",
    "user": "root",
    "password": "toor"
  }
}
```

# Run for development
```
grunt
```
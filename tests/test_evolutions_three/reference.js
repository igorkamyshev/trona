export default {
  evolutions: [
    {
      data: 'SELECT 11;\n#DOWN\nSELECT 11;\n',
      file: '1.sql',
      checksum: '669ee97b22c71ec97bfd4f0774fe130f',
      id: 1,
    },
    {
      data: 'SELECT 1;\n#DOWN\nSELECT 1;',
      file: '2-create.sql',
      checksum: 'd753695e97001daa6d7282ee553546f7',
      id: 2,
    },
    {
      data: 'SELECT 1;\n#DOWN\nSELECT 1;',
      file: '3.sql',
      checksum: 'd753695e97001daa6d7282ee553546f7',
      id: 3,
    },
    {
      data: 'SELECT 1;\n#DOWN\nSELECT 1;',
      file: '4-test.sql',
      checksum: 'd753695e97001daa6d7282ee553546f7',
      id: 4,
    },
    {
      data: 'SELECT 1;\n#DOWN\nSELECT 1;',
      file: '5-select-truncate.sql',
      checksum: 'd753695e97001daa6d7282ee553546f7',
      id: 5,
    },
  ],
  outOfScopeFiles: ['-33-delete.sql', 'lable-test.sql', 'reference.js'],
};

const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json({ limit: '500mb' }));



app.get('/', (req, res) => {
  res.send('¡Bienvenido a tu API!');
});

// Configurar la conexión a la base de datos MySQL
const connection = mysql.createConnection({
    host: '34.67.253.112',
    port: '3306',
    user: 'root',
    password: 'administrador123',
    database: 'depa_w'
  });
  
  
  
  
  // Conectar a la base de datos MySQL
  connection.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
    console.log('Conexión a la base de datos establecida');
  });
  
  // Ruta para obtener los datos de la base de datos de las patentes
  app.get('/TraerPatente', (req, res) => {
    const query = 'SELECT * FROM Vehiculo';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al obtener los datos' });
        return;
      }
      res.json(results);
    });
  });
  
  
  // Ruta para buscar un vehículo por su patente
  app.get('/buscarVehiculo', (req, res) => {
    const { patente } = req.query;
  
    const query = `
    SELECT Vehiculo.patente, Tipo_vehiculo.tipo_veh, Color_vehiculo.color_veh, Persona.primer_nombre, Persona.primer_apellido, Departamento.id_departamento, Estacionamiento.id_est ,Tipo_estacionamiento.tipo_est
      FROM Vehiculo
      JOIN Tipo_vehiculo ON Vehiculo.id_tipoveh = Tipo_vehiculo.id_tipoveh
      JOIN Color_vehiculo ON Vehiculo.id_color = Color_vehiculo.id_colorveh
      JOIN Persona_Vehiculo ON Vehiculo.patente = Persona_Vehiculo.patente
      JOIN Persona ON Persona_Vehiculo.rut = Persona.rut
      JOIN Departamento ON Persona.id_departamento = Departamento.id_departamento
      JOIN Estacionamiento ON Persona_Vehiculo.id_est = Estacionamiento.id_est
      JOIN Tipo_estacionamiento ON Estacionamiento.id_tipoest = Tipo_estacionamiento.id_tipoest
      WHERE Vehiculo.patente = ?`;
  
    connection.query(query, [patente], (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al buscar el vehículo' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ mensaje: 'Vehículo no encontrado en el condominio' });
      } else {
        const vehiculo = {
          patente: results[0].patente,
          tipo_veh: results[0].tipo_veh,
          color_veh: results[0].color_veh,
          primer_nombre: results[0].primer_nombre,
          primer_apellido: results[0].primer_apellido,
          id_departamento: results[0].id_departamento,
          puesto_est: results[0].puesto_est,
          id_est: results[0].id_est,
          tipo_est: results[0].tipo_est
        };
        res.json(vehiculo);
      }
    });
  });
  
  
  
  
  
  app.get('/departamentos/:id/persona', (req, res) => {
    const departamentoId = req.params.id;
  
    const query = `
    SELECT mail
    FROM Persona
    WHERE id_departamento = ?`;
  
    connection.query(query, [departamentoId], (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al obtener los correos electrónicos' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ mensaje: 'No se encontraron personas en el departamento' });
      } else {
        const correosElectronicos = results.map((result) => result.mail);
        res.json(correosElectronicos);
      }
    });
  });
  
  
  app.post('/InsertarPedido', (req, res) => {
    const {
      id_pedido,
      fecha_recepcion,
      fecha_entrega,
      evidencia_recepcion,
      evidencia_entrega,
      id_departamento,
      id_edificio,
      id_conjunto,
      rut_empleado,
      mensaje
    } = req.body;
  
    const query = `
      INSERT INTO Pedido (
        id_pedido,
        fecha_recepcion,
        fecha_entrega,
        evidencia_recepcion,
        evidencia_entrega,
        id_departamento,
        id_edificio,
        id_conjunto,
        rut_empleado,
        mensaje
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  
    const values = [
      id_pedido,
      fecha_recepcion,
      fecha_entrega,
      evidencia_recepcion,
      evidencia_entrega,
      id_departamento,
      id_edificio,
      id_conjunto,
      rut_empleado,
      mensaje
    ];
  
    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al insertar los datos' });
        return;
      }
      res.json({ message: 'Datos insertados correctamente' });
    });
  });
  
  app.get('/TraerDepartamento', (req, res) => {
    const query = 'SELECT * FROM Departamento';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al obtener los datos' });
        return;
      }
      res.json(results);
    });
  });
  
  
  app.get('/ObtenerPedidos', (req, res) => {
    const query = 'SELECT * FROM Pedido WHERE fecha_entrega IS NULL';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al obtener los datos de los pedidos' });
        return;
      }
      res.json(results);
    });
  });

  app.get('/ObtenerEstacionamientos', (req, res) => {
    const query = `
    SELECT e.id_est, te.tipo_est, e.estado
    FROM Estacionamiento AS e
    JOIN Tipo_estacionamiento AS te ON e.id_Tipoest = te.id_tipoest
  `;
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al obtener los datos de los estacionamientos' });
        return;
      }
      res.json(results);
    });
  });


  
  
  app.put('/ActualizarPedido/:id', (req, res) => {
    const idPedido = req.params.id;
    const nuevosDatos = req.body;
  
    const query = `
      UPDATE Pedido
      SET fecha_entrega = ?,
          evidencia_entrega = ?,
          rut_empleado_ent = ?
      WHERE id_pedido = ?`;
  
    const values = [
      nuevosDatos.fecha_entrega,
      nuevosDatos.evidencia_entrega,
      nuevosDatos.rut_empleado_ent,
      idPedido
    ];
  
    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al actualizar el pedido' });
        return;
      }
      
      // Obtener el pedido actualizado desde la base de datos
      const queryPedido = 'SELECT * FROM Pedido WHERE id_pedido = ?';
      connection.query(queryPedido, [idPedido], (err, results) => {
        if (err) {
          console.error('Error al obtener el pedido actualizado:', err);
          res.status(500).json({ error: 'Error al obtener el pedido actualizado' });
          return;
        }
        
        const pedidoActualizado = results[0];
        res.json(pedidoActualizado);
      });
    });
  });
  
  
  
  app.get('/TraerEmpleado', (req, res) => {
    const query = 'SELECT * FROM Empleado';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al obtener los datos' });
        return;
      }
      res.json(results);
    });
  });

  app.put('/estacionamiento/:id', (req, res) => {
    const idEstacionamiento = req.params.id;
    const nuevoEstado = req.body.estado;
  
    // Realiza la validación de entrada según tus necesidades
  
    // Actualiza el estado en la base de datos
    const query = `UPDATE Estacionamiento SET estado = ? WHERE id_est = ?`;
    connection.query(query, [nuevoEstado, idEstacionamiento], (error, results) => {
      if (error) {
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({ error: 'Ocurrió un error al actualizar el estado.' });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get('/buscarEnVisitas', (req, res) => {
    const patente = req.query.patente;
  
    const query = `
      SELECT v.rut_visita, v.dv, v.nombre, v.apellido, v.patente, v.id_departamento, v.id_edificio, v.id_est, e.estado, t.tipo_est
      FROM Visita v
      JOIN Estacionamiento e ON v.id_est = e.id_est
      JOIN Tipo_estacionamiento t ON e.id_tipoest = t.id_tipoest
      WHERE v.patente = ?
      ORDER BY v.id_visita DESC
      LIMIT 1;
    `;
  
    connection.query(query, [patente], (err, results) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al buscar en visitas' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ mensaje: 'No se encontraron resultados en visitas' });
      } else {
        const visita = results[0];
        res.json(visita);
      }
    });
  });
  
  


  app.post('/GuardarVisita', (req, res) => {
    const { rut_visita, dv, nombre, apellido, patente, id_est, id_departamento, id_edificio, id_conjunto, fecha_ing, fecha_sal } = req.body;
  
    const visita = {
      rut_visita,
      dv,
      nombre,
      apellido,
      patente,
      id_est,
      id_departamento,
      id_edificio,
      id_conjunto,
      fecha_ing,
      fecha_sal
    };
  
    const query = connection.query('INSERT INTO Visita SET ?', visita, (error, results) => {
      if (error) {
        console.error('Error al guardar la visita:', error);
        res.status(500).json({ error: 'Error al guardar la visita' });
        return;
      }
      res.json({ message: 'Visita guardada exitosamente' });
    });
  
    
  });

  app.put('/modificarFechaSal', (req, res) => {
    const patente = req.body.patente;
    const nuevaFechaSal = req.body.nuevaFechaSal;
  
    const query = `
      UPDATE Visita
      SET fecha_sal = ?
      WHERE patente = ?
      ORDER BY id_visita DESC
      LIMIT 1;
    `;
  
    connection.query(query, [nuevaFechaSal, patente], (err, result) => {
      if (err) {
        console.error('Error al realizar la consulta:', err);
        res.status(500).json({ error: 'Error al modificar la fecha de salida' });
        return;
      }
  
      if (result.affectedRows === 0) {
        res.status(404).json({ mensaje: 'No se encontró ninguna visita con la patente especificada' });
      } else {
        res.json({ mensaje: 'La fecha de salida se modificó correctamente' });
      }
    });
  });

  
  

app.listen(port,() => {
  console.log(`La API está escuchando en el puerto ${port}`);
});

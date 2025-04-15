import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

export default function Index(props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState("");
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState(props.items);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [adding, setAdding] = useState("");
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role === "admin") {
      setIsAdmin(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await axios.post(
        `${process.env.server}/pillow`,
        { name, price, length, id: selectedIndex, weight, quantity },
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );

      if (selectedIndex) {
        setItems(
          items.map((item) =>
            item._id === selectedIndex ? { ...response.data } : item
          )
        );
      } else {
        const newItem = response.data;
        setItems([...items, newItem]);
      }
      setName("");
      setPrice("");
      setLength("");
      setQuantity("");
      setWeight("");
      setAdding("");
      setSelectedIndex(null);
    } catch (error) {
      console.error("Error adding/updating item:", error);
    }
  };

  // Function to set inputs when a row is clicked
  const handleRowClick = (item, index) => {
    setName(item.name);
    setPrice(item.price);
    setLength(item.length);
    setWeight(item.weight);
    setQuantity(item.quantity);
    setSelectedIndex(item._id);
  };

  return (
    <Box display="flex" height="100vh">
      {/* Table on the Left (60%) */}
      <Box
        flex={6}
        bgcolor="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={4}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="90%"
        >
          <Typography variant="h4" gutterBottom>
            Дайын тауарлар тізімі
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setName("");
                setPrice("");
                setLength("");
                setQuantity("");
                setWeight("");
                setSelectedIndex(null);
              }}
            >
              Қосу
            </Button>
          )}
        </Box>
        <TableContainer component={Paper} sx={{ maxWidth: "90%" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Атауы</strong>
                </TableCell>
                <TableCell>
                  <strong>Бағасы (₸)</strong>
                </TableCell>
                <TableCell>
                  <strong>Ұзындығы (М)</strong>
                </TableCell>
                <TableCell>
                  <strong>Салмағы (КГ)</strong>
                </TableCell>
                <TableCell>
                  <strong>Штук (ШТ)</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <TableRow
                    key={index}
                    onClick={() => handleRowClick(item, index)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedIndex === index ? "#e3f2fd" : "inherit",
                    }}
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.price}₸</TableCell>
                    <TableCell>{item.length}м</TableCell>
                    <TableCell>{item.weight}кг</TableCell>
                    <TableCell>{item.quantity}шт</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Элементтер жоқ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Form on the Right (40%) */}
      <Box
        flex={4}
        bgcolor="#f5f5f5"
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="h4" gutterBottom>
          {selectedIndex === null
            ? "Дайын тауар қосу"
            : "Дайын тауар ақпараттарын өзгерту"}
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            label="Атауы"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={!isAdmin}
          />
          <TextField
            label="Бағасы"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <TextField
            label="Ұзындығы"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            required
          />
          <TextField
            label="Салмағы"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
          <TextField
            label="Штук"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          {!isAdmin && (
            <TextField
              label="Жаңадан қосу"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              required
            />
          )}
          <Button type="submit" variant="contained" color="success" fullWidth>
            {selectedIndex === null ? "Қосу" : "Өзгерту"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}

export const getStaticProps = async () => {
  try {
    const items = await axios.get(`${process.env.server}/pillow`);
    return {
      props: { items: items.data || [] },
      revalidate: 10, // Re-fetch data every 10 seconds
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

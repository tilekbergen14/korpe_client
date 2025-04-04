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
        `${process.env.server}/item`,
        { name, price, total, id: selectedIndex, adding },
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );

      if (selectedIndex) {
        setItems(
          items.map((item) =>
            item._id === selectedIndex
              ? { ...item, total: response.data.total }
              : item
          )
        );
      } else {
        const newItem = response.data;
        setItems([...items, newItem]);
      }
      setName("");
      setPrice("");
      setTotal("");
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
    setTotal(item.total);
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
            Тауарлар тізімі
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setName("");
                setPrice("");
                setTotal("");
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
                  <strong>Барлығы (М)</strong>
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
                    <TableCell>{item.total}м</TableCell>
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
          {selectedIndex === null ? "Мата қосу" : "Мата ақпараттарын өзгерту"}
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
            disabled={!isAdmin}
          />
          <TextField
            label="Барлығы"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            required
            disabled={!isAdmin}
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
    const items = await axios.get(`${process.env.server}/item`);
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

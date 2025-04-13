router.get('/me', verifyToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          // exclude password
        },
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
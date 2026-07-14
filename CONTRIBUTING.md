# Contributing to Ambika Pure Veg

We appreciate your interest in contributing to the Ambika Pure Veg Smart Restaurant Platform! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Respect differing opinions
- No harassment or discrimination

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit with clear messages: `git commit -m "feat: add new feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## Branch Naming Conventions

- `feature/feature-name` - New feature
- `fix/bug-name` - Bug fix
- `refactor/module-name` - Refactoring
- `docs/doc-name` - Documentation
- `test/test-name` - Tests

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting
- **refactor**: Code restructuring
- **test**: Adding tests
- **chore**: Maintenance

### Example
```
feat(frontend): add sentiment chart component

Add new chart component to display sentiment trends on admin dashboard.
Includes real-time updates via Socket.io.

Closes #123
```

## Code Style

### JavaScript/React

- Use ES6+ syntax
- Functional components with hooks
- Destructuring for props
- Clear variable names
- Comments for complex logic

```javascript
// Good
const MyComponent = ({ title, items }) => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{title}</h1>
      {items.map((item) => (
        <Item key={item.id} data={item} />
      ))}
    </div>
  );
};
```

### Python

- Follow PEP 8
- Use type hints
- Docstrings for functions
- Clear variable names

```python
def classify_sentiment(text: str) -> dict:
    """Classify sentiment of given text."""
    result = model.predict(text)
    return {
        "sentiment": result["label"],
        "confidence": result["score"]
    }
```

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

All new features should include:
- Unit tests
- Integration tests (if applicable)
- At least 80% code coverage

## Documentation

- Update README files for significant changes
- Add JSDoc comments to complex functions
- Document new API endpoints
- Keep architecture docs updated

## Pull Request Process

1. Update documentation as needed
2. Add/update tests
3. Ensure all tests pass: `npm test`
4. Run linter: `npm run lint`
5. Fill PR template completely
6. Link related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
Describe testing performed

## Screenshots (if UI changes)
Add relevant screenshots

## Checklist
- [ ] Tests pass
- [ ] No console errors
- [ ] Documentation updated
- [ ] Code reviewed for quality
- [ ] Commits are atomic and well-described
```

## Review Process

1. At least one approval required
2. Address review comments
3. Rebase if needed
4. Squash commits before merge

## Common Tasks

### Adding New API Endpoint

1. Create route in `backend/routes/`
2. Add validation middleware
3. Add to router: `app.use('/api/path', routeHandler)`
4. Add tests in `backend/tests/`
5. Update API documentation

### Adding New Frontend Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Update navigation if needed
4. Add styling with Tailwind
5. Test responsiveness

### Adding New Component

1. Create file in `frontend/src/components/`
2. Use functional component with hooks
3. Add PropTypes or TypeScript
4. Create stories if applicable
5. Add to component documentation

## Debugging Tips

### Backend
```bash
# Start with debugger
node --inspect server.js

# Check logs
docker-compose logs -f backend
```

### Frontend
- Open DevTools (F12)
- Check Console tab for errors
- Use React DevTools extension
- Network tab shows API calls

### Socket.io
```javascript
// Enable debug logging
localStorage.debug = 'socket.io-client:*'
```

## Performance Considerations

- Minimize bundle size
- Optimize database queries
- Use pagination for lists
- Cache frequently accessed data
- Profile before optimizing

## Security Guidelines

- Validate all inputs server-side
- Use parameterized queries
- Don't commit secrets
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting

## Release Process

1. Update version numbers
2. Update CHANGELOG
3. Create release tag: `git tag v1.0.0`
4. Create release notes
5. Deploy to production

## Versioning

Using Semantic Versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

## Help and Support

- Check existing issues
- Ask questions in discussions
- Email: dev@ambika.com

## Appreciation

Thank you for contributing! Your effort helps make Ambika Pure Veg better for everyone.

---

**Last Updated**: 2024

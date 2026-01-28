import type { PetDraft, PetUpsertPayload } from '../../../composables/createNovoPetDraft'

export type Pet = PetDraft & {
  id: string
  tutor: string
}

export type SelectOption = { id: string; label: string }

export type PetsLoadOptions = {
  clientes: SelectOption[]
  especies: SelectOption[]
  racasByEspecie: Record<string, SelectOption[]>
  pelagens: SelectOption[]
}

let nextId = 100
const db = new Map<string, Pet>()

function ensureSeeded() {
  if (db.size) return

  const clientes: SelectOption[] = [
    { id: '1', label: 'Ana Souza' },
    { id: '2', label: 'Bruno Lima' },
    { id: '3', label: 'Carla Oliveira' },
  ]

  const especies = ['Cachorro', 'Gato']

  for (let i = 1; i <= 23; i++) {
    const sexo = i % 2 === 0 ? 'F' : 'M'
    const especie = especies[i % especies.length]!
    const tutor = clientes[i % clientes.length]!.label

    const pet: Pet = {
      id: String(nextId++),
      nome: `Pet ${i}`,
      sexo,
      cliente_id: clientes[i % clientes.length]!.id,
      especie_id: especie === 'Cachorro' ? '1' : '2',
      raca_id: String((i % 5) + 1),
      pelagem_id: String((i % 3) + 1),
      cor: '',
      peso: '',
      porte: '',
      porte_outro: '',
      origem_tipo: '',
      origem_detalhe: '',
      origem: '',
      data_nascimento_pet: '',
      chip: '',
      tem_pedigree: '',
      pedigree: '',
      observacao: '',
      tutor,
    }
    db.set(pet.id, pet)
  }
}

export function listPets(search?: string): Pet[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all

  return all.filter((p) => {
    return (
      p.nome.toLowerCase().includes(normalized) ||
      p.tutor.toLowerCase().includes(normalized) ||
      p.especie_id.toLowerCase().includes(normalized) ||
      p.raca_id.toLowerCase().includes(normalized)
    )
  })
}

export async function loadPetsOptions(): Promise<PetsLoadOptions> {
  ensureSeeded()

  return {
    clientes: [
      { id: '1', label: 'Ana Souza' },
      { id: '2', label: 'Bruno Lima' },
      { id: '3', label: 'Carla Oliveira' },
    ],
    especies: [
      { id: '1', label: 'Cachorro' },
      { id: '2', label: 'Gato' },
    ],
    racasByEspecie: {
      '1': [
        { id: '1', label: 'SRD' },
        { id: '2', label: 'Poodle' },
        { id: '3', label: 'Labrador' },
      ],
      '2': [
        { id: '4', label: 'Siamês' },
        { id: '5', label: 'Persa' },
      ],
    },
    pelagens: [
      { id: '1', label: 'Curta' },
      { id: '2', label: 'Média' },
      { id: '3', label: 'Longa' },
    ],
  }
}

export async function getPetById(id: string): Promise<Pet | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createPet(payload: PetUpsertPayload): Promise<Pet> {
  ensureSeeded()

  const options = await loadPetsOptions()
  const tutorLabel = options.clientes.find((c) => c.id === payload.cliente_id)?.label ?? ''

  const pet: Pet = {
    ...payload,
    id: String(nextId++),
    tutor: tutorLabel,
  }

  db.set(pet.id, pet)
  return pet
}

export async function updatePet(id: string, payload: PetUpsertPayload): Promise<Pet | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const options = await loadPetsOptions()
  const tutorLabel = options.clientes.find((c) => c.id === payload.cliente_id)?.label ?? ''

  const updated: Pet = { ...existing, ...payload, id, tutor: tutorLabel }
  db.set(id, updated)
  return updated
}

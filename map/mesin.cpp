#include <emscripten.h>
#include <stdint.h> // Ditambahkan untuk tipe data uint8_t

extern "C"
{

    EMSCRIPTEN_KEEPALIVE
    int hitung_luas_wilayah(int panjang, int lebar)
    {
        return panjang * lebar;
    }

    // Mengubah float* menjadi uint8_t* agar pas dengan Uint8Array Azgaar
    EMSCRIPTEN_KEEPALIVE
    void simulasi_erosi_mesh(uint8_t *heightmap, int size, float erosion_factor)
    {
        for (int i = 0; i < size; ++i)
        {
            if (heightmap[i] > 20)
            { // Nilai di atas 20 adalah daratan di Azgaar
                int penurunan = static_cast<int>(heightmap[i] * erosion_factor * 0.1f);
                if (penurunan < 1)
                    penurunan = 1; // Minimal berkurang 1 tingkat

                if (heightmap[i] - penurunan > 20)
                {
                    heightmap[i] -= penurunan;
                }
                else
                {
                    heightmap[i] = 20; // Batas bawah erosi (pantai)
                }
            }
        }
    }
}